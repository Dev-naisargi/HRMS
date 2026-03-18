const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    checkIn: Date,

    checkOut: Date,

    workingHours: Number,

    // Payroll Status
    status: {
      type: String,
      enum: ["Present", "Absent", "Half Day", "Overtime"],
      default: "Present",
    },

    // Discipline Tracking
    isLate: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Attendance", attendanceSchema);