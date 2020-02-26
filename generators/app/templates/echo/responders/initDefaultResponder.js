const initDefaultResponder = () => {
  const handleTurn = async context => {
    return Promise.resolve({
      text: `${context.activity.text} to you too`,
      raw: {}
    });
  };
  return handleTurn;
};

module.exports.initDefaultResponder = initDefaultResponder;
