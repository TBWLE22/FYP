const express = require("express");
const router = express.Router();
const flowRouter = require("../modules/flows/flow.api");

router.get("/api/v1", (req, res, next) => {
  try {
    res.json({ msg: "MovieMate API is working" });
  } catch (e) {
    next(e);
  }
});

router.use("/api/v1/flows", flowRouter);
module.exports = router;
