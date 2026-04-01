/**
 * LEAVE CALCULATION UTILITY - SaaS Level
 * Handles multiple leave types, balances, and deductions
 * Integrated with leave policies per company
 */

const Leave = require("../models/Leave");
const Employee = require("../models/Employee");

/**
 * Get leave policy for a company
 * @param {ObjectId} companyId
 * @returns {Object} Leave policy with leave type limits
 */
const getLeavePolicy = (company) => {
  return (
    company.leavePolicy || {
      casual: 12, // Casual leave days per year
      sick: 8, // Sick leave days per year
      earned: 16, // Earned leave days per year
      paid: 0, // Paid leave days - not deducted from salary
    }
  );
};

/**
 * Calculate leave balance for an employee in a year
 * @param {ObjectId} employeeId
 * @param {Number} year
 * @param {Object} company
 * @returns {Object} Leave balance breakdown
 */
const getLeaveBalanceForYear = async (employeeId, year, company) => {
  const policy = getLeavePolicy(company);

  // Get all approved leaves for this employee this year
  const approvedLeaves = await Leave.find({
    employeeId,
    companyId: company._id,
    status: "APPROVED",
    startDate: {
      $gte: new Date(`${year}-01-01`),
      $lte: new Date(`${year}-12-31`),
    },
  });

  // Calculate used leaves by type
  const usedLeaves = {
    casual: 0,
    sick: 0,
    earned: 0,
    paid: 0,
  };

  for (const leave of approvedLeaves) {
    const type = leave.type.toLowerCase();
    if (usedLeaves.hasOwnProperty(type)) {
      usedLeaves[type] += leave.duration || 0;
    }
  }

  // Calculate remaining balance
  const balance = {
    casual: Math.max(0, policy.casual - usedLeaves.casual),
    sick: Math.max(0, policy.sick - usedLeaves.sick),
    earned: Math.max(0, policy.earned - usedLeaves.earned),
    paid: Math.max(0, policy.paid - usedLeaves.paid),
  };

  return {
    policy,
    used: usedLeaves,
    balance,
    total: {
      allocated: policy.casual + policy.sick + policy.earned + policy.paid,
      used: usedLeaves.casual + usedLeaves.sick + usedLeaves.earned + usedLeaves.paid,
      remaining:
        balance.casual + balance.sick + balance.earned + balance.paid,
    },
  };
};

/**
 * Calculate leave deduction for a specific month
 * Deducts only for unpaid leaves (Casual, Sick, Earned)
 * PAID leaves do NOT result in salary deductions
 *
 * @param {Object} options
 * @param {ObjectId} options.employeeId
 * @param {String} options.month - e.g., "January"
 * @param {Number} options.year - e.g., 2026
 * @param {Number} options.monthlySalary
 * @param {Number} options.workingDaysPerMonth
 * @param {Object} options.company
 * @returns {Object} Leave deduction breakdown
 */
const calculateLeaveDeduction = async (options) => {
  const {
    employeeId,
    month,
    year,
    monthlySalary,
    workingDaysPerMonth = 26,
    company,
  } = options;

  if (!employeeId || !month || !year || !company) {
    throw new Error(
      "employeeId, month, year, and company are required for leave calculation"
    );
  }

  // Calculate per day salary for leave deduction
  const perDaySalary = monthlySalary / workingDaysPerMonth;

  // Get month date range
  const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
  const startDate = new Date(year, monthIndex, 1);
  const endDate = new Date(year, monthIndex + 1, 0, 23, 59, 59);

  // Get all approved leaves for this employee in this month (APPROVED only)
  const approvedLeaves = await Leave.find({
    employeeId,
    companyId: company._id,
    status: "APPROVED", // Consider only approved leaves
    startDate: { $gte: startDate },
    endDate: { $lte: endDate },
  });

  // Categorize leaves by type
  const leavesByType = {
    CASUAL: [],
    SICK: [],
    EARNED: [],
    PAID: [], // These do NOT deduct salary
  };

  for (const leave of approvedLeaves) {
    if (leavesByType.hasOwnProperty(leave.type)) {
      leavesByType[leave.type].push(leave);
    }
  }

  // Calculate total unpaid leave days (excludes PAID leaves)
  const casualDays =
    leavesByType.CASUAL.reduce((sum, l) => sum + (l.duration || 0), 0) || 0;
  const sickDays =
    leavesByType.SICK.reduce((sum, l) => sum + (l.duration || 0), 0) || 0;
  const earnedDays =
    leavesByType.EARNED.reduce((sum, l) => sum + (l.duration || 0), 0) || 0;
  const paidDays =
    leavesByType.PAID.reduce((sum, l) => sum + (l.duration || 0), 0) || 0;

  // Total unpaid leaves (what gets deducted from salary)
  const unpaidLeaveDays = casualDays + sickDays + earnedDays;

  // Only deduct for unpaid leaves
  const leaveDeduction = Math.round(unpaidLeaveDays * perDaySalary);

  return {
    // Leave breakdown
    casual: {
      days: casualDays,
      deduction: Math.round(casualDays * perDaySalary),
    },
    sick: {
      days: sickDays,
      deduction: Math.round(sickDays * perDaySalary),
    },
    earned: {
      days: earnedDays,
      deduction: Math.round(earnedDays * perDaySalary),
    },
    paid: {
      days: paidDays,
      deduction: 0, // PAID leaves do NOT deduct salary
    },

    // Totals
    totalUnpaidDays: unpaidLeaveDays,
    totalPaidDays: paidDays,
    totalAllDays: unpaidLeaveDays + paidDays,
    leaveDeduction, // Amount deducted from salary
    perDaySalary,
  };
};

/**
 * Calculate detailed leave statistics for payroll
 * @param {ObjectId} employeeId
 * @param {Number} year
 * @param {Object} company
 * @returns {Object} Year-to-date leave statistics
 */
const getLeaveStatistics = async (employeeId, year, company) => {
  const policy = getLeavePolicy(company);

  // Get all approved leaves for the year
  const approvedLeaves = await Leave.find({
    employeeId,
    companyId: company._id,
    status: "APPROVED",
    startDate: {
      $gte: new Date(`${year}-01-01`),
      $lte: new Date(`${year}-12-31`),
    },
  });

  const stats = {
    casual: { allocated: policy.casual, used: 0, remaining: policy.casual },
    sick: { allocated: policy.sick, used: 0, remaining: policy.sick },
    earned: { allocated: policy.earned, used: 0, remaining: policy.earned },
    paid: { allocated: policy.paid, used: 0, remaining: policy.paid },
  };

  // Count used leaves
  for (const leave of approvedLeaves) {
    const type = leave.type.toLowerCase();
    if (stats.hasOwnProperty(type)) {
      stats[type].used += leave.duration || 0;
      stats[type].remaining = Math.max(
        0,
        stats[type].allocated - stats[type].used
      );
    }
  }

  return {
    year,
    leaves: stats,
    totalAllocated:
      stats.casual.allocated +
      stats.sick.allocated +
      stats.earned.allocated +
      stats.paid.allocated,
    totalUsed:
      stats.casual.used +
      stats.sick.used +
      stats.earned.used +
      stats.paid.used,
    totalRemaining:
      stats.casual.remaining +
      stats.sick.remaining +
      stats.earned.remaining +
      stats.paid.remaining,
  };
};

module.exports = {
  getLeavePolicy,
  getLeaveBalanceForYear,
  calculateLeaveDeduction,
  getLeaveStatistics,
};
