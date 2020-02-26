const { ActivityHandler, MessageFactory } = require("botbuilder");
const { initDefaultResponder } = require("./responders/initDefaultResponder");
const { initCocoResponder } = require("./responders/initCocoResponder");
const { initWatsonResponder } = require("./responders/initWatsonResponder");

const MAX_SWITCH_RETRIES = 3;

class ResponderBot extends ActivityHandler {
  switchResponders(response) {
    //responder switching logic, replace the conditions with your own
    if (
      this.currentResponseHandler === this.cocoResponder &&
      response.raw.component_done
    ) {
      response.reset();
      this.currentResponseHandler = this.watsonResponder;
    } else if (this.currentResponseHandler === this.watsonResponder) {
      this.currentResponseHandler = this.defaultResponder;
    } else {
      this.currentResponseHandler = this.cocoResponder;
    }
  }

  async getResponse(context) {
    const response = await this.currentResponseHandler(context);
    if (this.responseCounter < MAX_SWITCH_RETRIES && !response.text) {
      this.responseCounter++;
      this.switchResponders(response);
      return this.getResponse(context);
    }

    this.responseCounter = 0;

    return Promise.resolve(response);
  }

  constructor() {
    super();

    this.defaultResponder = initDefaultResponder();
    this.watsonResponder = initWatsonResponder();
    this.cocoResponder = initCocoResponder();
    this.currentResponseHandler = this.defaultResponder;
    this.responseCounter = 0;

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
module.exports.ResponderBot = ResponderBot;
