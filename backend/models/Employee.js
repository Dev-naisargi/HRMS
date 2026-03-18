const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
{
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  phone: String,

  position: {
    type: String,
    required: true,
  },

  department: String,

  salary: Number,

  dob: Date,

  doj: Date,

  status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active",
  },

  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
},
{ timestamps: true }
);
module.exports = mongoose.model("Employee", employeeSchema);