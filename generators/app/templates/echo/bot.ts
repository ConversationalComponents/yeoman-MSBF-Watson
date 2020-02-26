import { ActivityHandler, MessageFactory, TurnContext } from "botbuilder";
import { initDefaultResponder } from "./responders/initDefaultResponder";
import { initCocoResponder } from "./responders/initCocoResponder";
import { initWatsonResponder } from "./responders/initWatsonResponder";
import * as CocoSdk from "@conversationalcomponents/sdk";
import AssistantV2 = require("ibm-watson/assistant/v2");

type Response = {
  text: string;
  raw:
    | CocoSdk.CocoResponse
    | AssistantV2.Response<AssistantV2.MessageResponse>
    | {};
  reset?: () => void;
};

type Responder = (context: TurnContext) => Promise<Response>;

const MAX_SWITCH_RETRIES = 3;

export class ResponderBot extends ActivityHandler {
  private defaultResponder = initDefaultResponder();
  private watsonResponder = initWatsonResponder();
  private cocoResponder = initCocoResponder();
  private currentResponseHandler: Responder = this.defaultResponder;

  private responseCounter = 0;

  private switchResponders = (response: Response) => {
    //responder switching logic, replace the conditions with your own
    if (
      this.currentResponseHandler === this.cocoResponder &&
      (response.raw as CocoSdk.CocoResponse).component_done
    ) {
      response.reset();
      this.currentResponseHandler = this.watsonResponder;
    } else if (this.currentResponseHandler === this.watsonResponder) {
      this.currentResponseHandler = this.defaultResponder;
    } else {
      this.currentResponseHandler = this.cocoResponder;
    }
  };

  private getResponse = async (context: TurnContext): Promise<Response> => {
    const response = await this.currentResponseHandler(context);
    if (this.responseCounter < MAX_SWITCH_RETRIES && !response.text) {
      this.responseCounter++;
      this.switchResponders(response);
      return this.getResponse(context);
    }

    this.responseCounter = 0;

    return Promise.resolve(response);
  };

  constructor() {
    super();

    this.onMessage(async (context, next) => {
      const response = await this.getResponse(context);
      await context.sendActivity(MessageFactory.text(response.text));
      this.switchResponders(response);

      // By calling next() you ensure that the next BotHandler is run.
      await next();
    });

    this.onMembersAdded(async (context, next) => {
      const membersAdded = context.activity.membersAdded;
      const welcomeText = "Hello and welcome!";
      for (const member of membersAdded) {
        if (member.id !== context.activity.recipient.id) {
          await context.sendActivity(
            MessageFactory.text(welcomeText, welcomeText)
          );
        }
      }
      // By calling next() you ensure that the next BotHandler is run.
      await next();
    });
  }
}
