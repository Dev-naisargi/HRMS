const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    name: { type: String, unique: true, lowercase: true, required: true },
    address: { type: String, required: true },
    email: { type: String }, // Company contact email
    phone: { type: String },
    address: { type: String },
    industry: { type: String },

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"],
      default: "PENDING",
    },

    rejectionReason: { type: String },

    subscription: {
      plan: {
        type: String,
        enum: ["BASIC", "PREMIUM", "ENTERPRISE"],
        default: "BASIC",
      },
      startDate: { type: Date },
      endDate: { type: Date },
      isActive: { type: Boolean, default: false },
    },

    adminEmail: { type: String, required: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Company", companySchema);
