const flowModel = require("./flow.model");

const getFlows = async (req, res) => {
  return await flowModel.find();
};

const createFlow = async (payload) => {
  // const flow = await flowModel.findOne({
  //   flowBytespersec: req.flowBytespersec,
  // });
  // if (flow) throw new Error("flow already exists");
  console.log(payload);
  return await flowModel.create(payload);
};

module.exports = {
  getFlows,
  createFlow,
};
