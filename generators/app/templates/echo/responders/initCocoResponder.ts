import { TurnContext } from "botbuilder";
import * as CocoSdk from "@conversationalcomponents/sdk";

export const ComponentSession = CocoSdk.ComponentSession;
export const componentId = "namer_vp3";
export const cocoDevKey = "hackathon";

export const initCocoResponder = () => {
  let coco = new ComponentSession(componentId, cocoDevKey);
  const reset = () => {
    coco = new ComponentSession(componentId, cocoDevKey);
  };
  const handleTurn = async (context: TurnContext) => {
    const cocoReply = await coco.call(context.activity.text);
    return Promise.resolve({
      text: cocoReply.response,
      raw: cocoReply,
      reset
    });
  };
  return handleTurn;
};
