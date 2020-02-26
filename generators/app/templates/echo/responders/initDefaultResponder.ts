import { TurnContext } from "botbuilder";
export const initDefaultResponder = () => {
  const handleTurn = async (context: TurnContext) => {
    return Promise.resolve({
      text: `${context.activity.text} to you too`,
      raw: {}
    });
  };
  return handleTurn;
};
