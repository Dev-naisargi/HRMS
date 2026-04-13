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

    // ── Break Tracking ──
    breakStart: Date,
    breakEnd: Date,
    breakMinutes: {
      type: Number,
      default: 0,
    },

    // ── 4-Stamp Status ──
    stampStatus: {
      type: String,
      enum: ["checked_in", "on_break", "resumed", "checked_out"],
      default: "checked_in",
    },

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