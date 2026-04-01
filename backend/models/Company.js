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

    salaryStructure: {
      hraPercent: { type: Number, default: 20 },
      allowancePercent: { type: Number, default: 10 },
      pfPercent: { type: Number, default: 12 },
      taxPercent: { type: Number, default: 10 },
      overtimeRateMultiplier: { type: Number, default: 1.5 }, // 1.5x per hour/day
      latePenaltyPerDay: { type: Number, default: 100 },
      workingDaysPerMonth: { type: Number, default: 26 },
    },

    leavePolicy: {
      casual: { type: Number, default: 12 }, // Casual leave days per year
      sick: { type: Number, default: 8 }, // Sick leave days per year
      earned: { type: Number, default: 16 }, // Earned leave days per year
      paid: { type: Number, default: 0 }, // Paid leave days (not deducted from salary)
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Company", companySchema);
