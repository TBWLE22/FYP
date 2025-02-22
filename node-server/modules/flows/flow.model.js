const { Schema, model } = require("mongoose");

const flowSchema = new Schema(
  {
    // protocol: { type: String, required: true },
    // flowBytespersec: { type: Number, required: true },
    // sourceIP: { type: String, required: true },
    // destinationIP: { type: String, required: true },
    // spoofedIP: { type: String, required: true },
    data: { type: Array, required: true },
  },
  { timestamps: true }
);

module.exports = model("Flow", flowSchema);
