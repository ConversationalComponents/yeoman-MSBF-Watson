import { TurnContext } from "botbuilder";
import { IamAuthenticator } from "ibm-watson/auth";
import * as AssistantV2 from "ibm-watson/assistant/v2";

const version = `2020-02-05`;
const url = `https://api.eu-de.assistant.watson.cloud.ibm.com/instances/585e9c13-0876-4c1b-9f83-74daebf425f9`;
const apikey = `Fa1ln-3wucpe2jvhgOdHXrB5bTDwZsOD_xb_fSjLhiK8`;
const assistantId = "fc256c10-383b-4b29-b8e1-51142358bf7e";
let assistantSessionId = "";

export const initWatsonResponder = () => {
  const assistant = new AssistantV2({
    version,
    authenticator: new IamAuthenticator({
      apikey
    }),
    url
  });
  assistant
    .createSession({ assistantId })
    .then(value => (assistantSessionId = value.result.session_id));
  const handleTurn = async (context: TurnContext) => {
    const res = await assistant.message({
      assistantId,
      sessionId: assistantSessionId,
      input: {
        message_type: "text",
        text: context.activity.text
      }
    });
    return Promise.resolve({
      text: res.result.output.generic.length
        ? res.result.output.generic[0].text
        : "",
      raw: res
    });
  };
  return handleTurn;
};
