const CocoSdk = require("@conversationalcomponents/sdk");

const ComponentSession = CocoSdk.ComponentSession;
const componentId = "namer_vp3";
const cocoDevKey = "hackathon";

const initCocoResponder = () => {
  let coco = new ComponentSession(componentId, cocoDevKey);
  const reset = () => {
    coco = new ComponentSession(componentId, cocoDevKey);
  };
  const handleTurn = async context => {
    const cocoReply = await coco.call(context.activity.text);
    return Promise.resolve({
      text: cocoReply.response,
      raw: cocoReply,
      reset
    });
  };
  return handleTurn;
};

module.exports.initCocoResponder = initCocoResponder;
