const mongoose = require("mongoose");

const payrollSchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    companyId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Company',  required: true },

    month: { type: String, required: true }, // e.g. "March"
    year:  { type: Number, required: true }, // e.g. 2026

    // ── Earnings ──
    basicSalary:   { type: Number, default: 0 },
    hra:           { type: Number, default: 0 }, // 20% of basic
    allowances:    { type: Number, default: 0 }, // 10% of basic
    bonus:         { type: Number, default: 0 },
    overtimePay:   { type: Number, default: 0 },
    grossPay:      { type: Number, default: 0 },

    // ── Deductions ──
    pf:              { type: Number, default: 0 }, // 12% of basic
    tax:             { type: Number, default: 0 }, // 10% of basic
    leaveDeduction:  { type: Number, default: 0 }, // From approved leaves (Casual, Sick, Earned)
    absenceDeduction:{ type: Number, default: 0 }, // From unrecorded/unapproved absences
    lateDeduction:   { type: Number, default: 0 }, // lateDays * penalty
    totalDeductions: { type: Number, default: 0 },

    // ── Attendance Summary ──
    workingDays:   { type: Number, default: 26 },
    presentDays:   { type: Number, default: 0 },
    absentDays:    { type: Number, default: 0 },
    lateDays:      { type: Number, default: 0 },
    overtimeDays:  { type: Number, default: 0 },
    halfDays:      { type: Number, default: 0 },

    // ── Final ──
    netPay: { type: Number, required: true },

    // ── Status Flow ──
    status: {
        type: String,
        enum: ['DRAFT', 'PENDING', 'APPROVED', 'PAID', 'REJECTED'],
        default: 'DRAFT'
    },

    // ── Audit ──
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    paidBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rejectionReason: String,
    submittedAt: Date,
    approvedAt:  Date,
    paidAt:      Date,

}, { timestamps: true });

// One payroll per employee per month per year
payrollSchema.index({ companyId: 1, month: 1, year: 1, employeeId: 1 }, { unique: true });

module.exports = mongoose.model("Payroll", payrollSchema);