const router = require("express").Router();
const flowController = require("./flow.controller");

router.get("/", async (req, res, next) => {
  try {
    const flow = await flowController.getFlows();
    res.json({ msg: "retreived all flow", result: flow });
  } catch (e) {
    next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    console.log(req.body);
    const flow = await flowController.createFlow(req.body);
    res.json({ msg: "Created new flow", data: flow });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
