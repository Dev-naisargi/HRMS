/**
 * CENTRALIZED SALARY CALCULATION UTILITY
 * SaaS-level, fully configurable payroll calculation
 * Used for: preview, generation, and payslip display
 */

/**
 * Calculate net salary with earnings and deductions
 * @param {Object} options - Calculation parameters
 * @param {Number} options.monthlySalary - Employee's monthly salary (basic)
 * @param {Number} options.presentDays - Number of days present
 * @param {Number} options.absentDays - Number of days absent (from attendance)
 * @param {Number} options.lateDays - Number of late days
 * @param {Number} options.halfDays - Number of half days (optional)
 * @param {Number} options.overtimeDays - Number of overtime days (optional)
 * @param {Number} options.bonus - Bonus amount (optional)
 * @param {Number} options.leaveDeduction - Leave deduction from approved leaves (optional)
 * @param {Object} options.salaryStructure - Company salary structure config
 * @returns {Object} Complete salary breakdown
 */
const calculateSalary = (options) => {
  const {
    monthlySalary,
    presentDays,
    absentDays,
    lateDays,
    halfDays = 0,
    overtimeDays = 0,
    bonus = 0,
    leaveDeduction = 0, // From leave records, not calculated from absentDays
    salaryStructure = {
      hraPercent: 20,
      allowancePercent: 10,
      pfPercent: 12,
      taxPercent: 10,
      overtimeRateMultiplier: 1.5,
      latePenaltyPerDay: 100,
      workingDaysPerMonth: 26,
    },
  } = options;

  // ════════════════════════════════════════════════════
  // 1. EARNINGS CALCULATION
  // ════════════════════════════════════════════════════

  const basicSalary = monthlySalary || 0;

  // HRA (House Rent Allowance)
  const hra = Math.round(basicSalary * (salaryStructure.hraPercent / 100));

  // Allowances
  const allowances = Math.round(
    basicSalary * (salaryStructure.allowancePercent / 100)
  );

  // Overtime Pay
  // Per day salary = monthly salary / working days
  const perDaySalary = basicSalary / salaryStructure.workingDaysPerMonth;
  const overtimePay = Math.round(
    overtimeDays * perDaySalary * salaryStructure.overtimeRateMultiplier
  );

  // Bonus
  const bonusAmount = bonus || 0;

  // Gross Pay (before deductions)
  const grossPay = basicSalary + hra + allowances + overtimePay + bonusAmount;

  // ════════════════════════════════════════════════════
  // 2. DEDUCTIONS CALCULATION
  // ════════════════════════════════════════════════════

  // Provident Fund (PF)
  const pf = Math.round(basicSalary * (salaryStructure.pfPercent / 100));

  // Tax (TDS)
  const tax = Math.round(basicSalary * (salaryStructure.taxPercent / 100));

  // Leave Deduction (from approved leaves: Casual, Sick, Earned)
  // PAID leaves do NOT deduct salary
  const finalLeaveDeduction = leaveDeduction || 0;

  // Half Day Deduction (50% of per day salary)
  const halfDayDeduction = Math.round(halfDays * perDaySalary * 0.5);

  // Late Deduction
  const lateDeduction = lateDays * salaryStructure.latePenaltyPerDay;

  // Absence Deduction (for unrecorded/unapproved absences)
  // Only deduct for absences that are NOT covered by leaves
  const absenceDeduction = Math.round(absentDays * perDaySalary);

  // Total Deductions
  const totalDeductions =
    pf + tax + finalLeaveDeduction + halfDayDeduction + lateDeduction + absenceDeduction;

  // ════════════════════════════════════════════════════
  // 3. NET PAY CALCULATION
  // ════════════════════════════════════════════════════

  const netPay = Math.max(0, grossPay - totalDeductions);

  // ════════════════════════════════════════════════════
  // 4. RETURN COMPLETE BREAKDOWN
  // ════════════════════════════════════════════════════

  return {
    // Earnings
    basicSalary,
    hra,
    allowances,
    overtimePay,
    bonus: bonusAmount,
    grossPay,

    // Deductions
    pf,
    tax,
    leaveDeduction: finalLeaveDeduction, // From approved leaves
    absenceDeduction, // From unrecorded/unapproved absences
    lateDeduction,
    totalDeductions,

    // Attendance Details
    presentDays,
    absentDays,
    lateDays,
    halfDays,
    overtimeDays,
    workingDaysPerMonth: salaryStructure.workingDaysPerMonth,

    // Net Pay
    netPay,
  };
};

const formatSalaryBreakdown = (calculation) => {
  return {
    earnings: {
      basicSalary: calculation.basicSalary,
      hra: calculation.hra,
      allowances: calculation.allowances,
      overtime: calculation.overtimePay,
      bonus: calculation.bonus,
      total: calculation.grossPay,
    },
    deductions: {
      pf: calculation.pf,
      tax: calculation.tax,
      leaves: calculation.leaveDeduction, // From approved leaves
      absences: calculation.absenceDeduction, // From unrecorded absences
      late: calculation.lateDeduction,
      total: calculation.totalDeductions,
    },
    attendance: {
      present: calculation.presentDays,
      absent: calculation.absentDays,
      late: calculation.lateDays,
      halfDays: calculation.halfDays,
      overtime: calculation.overtimeDays,
      workingDays: calculation.workingDaysPerMonth,
    },
    netPay: calculation.netPay,
  };
};

module.exports = {
  calculateSalary,
  formatSalaryBreakdown,
};
