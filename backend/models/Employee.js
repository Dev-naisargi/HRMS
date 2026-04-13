const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },

    phone: {
      type: String,
      required: true
    },


    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true
    },

    department: {
      type: String,
      required: true,
      trim: true
    },

    designation: {
      type: String,
      required: true,
      trim: true
    },



    salary: {
      type: Number,
      default: 0
    },

    dob: {
      type: Date,
      required: true
    },

    doj: {
      type: Date,
      required: true
    },



  },
  { timestamps: true }
);

// ✅ prevent duplicate employee per user
employeeSchema.index({ userId: 1 }, { unique: true });

module.exports = mongoose.model("Employee", employeeSchema);