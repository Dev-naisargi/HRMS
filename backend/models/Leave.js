const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema(
{
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true
  },

  type: {
    type: String,
    enum: ["Sick", "Casual", "Paid"],
    required: true
  },

  from: {
    type: Date,
    required: true
  },

  to: {
    type: Date,
    required: true
  },

  totalDays: {
    type: Number
  },

  reason: {
    type: String,
    required: true
  },

  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending"
  }

},
{ timestamps: true }
);

module.exports = mongoose.model("Leave", leaveSchema);