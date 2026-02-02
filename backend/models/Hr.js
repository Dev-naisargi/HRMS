const mongoose = require("mongoose");

const HrSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["HR", "ADMIN"],
      default: "HR",
    },
  },
  { timestamps: true },
);

const Hr = mongoose.model("Hr", HrSchema);

module.exports = Hr;
