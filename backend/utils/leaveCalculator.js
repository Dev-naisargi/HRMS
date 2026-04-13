const Leave = require("../models/Leave");

/**
 * LEAVE CALCULATOR - SaaS Level
 *
 * Proper leave deduction based on:
 * - Only APPROVED leaves (status = 'APPROVED')
 * - Leave type (CASUAL, SICK, EARNED, PAID)
 * - PAID leaves do NOT result in salary deduction
 * - Unpaid leaves (CASUAL, SICK, EARNED) are deducted from salary
 */

/**
 * Get approved leaves for an employee in a specific month
 * @param {ObjectId} employeeId
 * @param {number} month (1-12)
 * @param {number} year
 * @returns {Object} { casual, sick, earned, paid } - count of approved days
 */
const getApprovedLeavesForMonth = async (employeeId, month, year) => {
    const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
    const startDate = new Date(year, monthIndex, 1);
    const endDate = new Date(year, monthIndex + 1, 0, 23, 59, 59);

    // Get all APPROVED leaves for this employee in this month
    const approvedLeaves = await Leave.find({
        employeeId,
        status: 'APPROVED', // ✓ ONLY approved leaves
        startDate: { $lte: endDate },
        endDate: { $gte: startDate },
    });

    // Count by type
    const leaveCounts = {
        casual: 0,
        sick: 0,
        earned: 0,
        paid: 0,
    };

    for (const leave of approvedLeaves) {
        const leaveType = leave.type?.toLowerCase() || 'casual';
        if (leaveCounts.hasOwnProperty(leaveType)) {
            leaveCounts[leaveType] += leave.duration || 0;
        }
    }

    return leaveCounts;
};

/**
 * Calculate leave deduction for payroll
 *
 * LOGIC:
 * - PAID leaves: 0 deduction (company pays)
 * - CASUAL, SICK, EARNED: deducted from salary
 * - leaveDeduction = (casual + sick + earned) * (salary / workingDays)
 *
 * @param {Object} leaveBalances { casual, sick, earned, paid }
 * @param {number} basicSalary
 * @param {number} workingDays (default: 26)
 * @returns {number} total leave deduction amount
 */
const calculateLeaveDeduction = (leaveBalances, basicSalary, workingDays = 26) => {
    // Only UNPAID leaves are deducted
    const unpaidLeaveDays = (leaveBalances.casual || 0) +
                           (leaveBalances.sick || 0) +
                           (leaveBalances.earned || 0);

    // PAID leaves are NOT deducted
    // leaveBalances.paid is ignored

    const perDaySalary = basicSalary / workingDays;
    const leaveDeduction = Math.round(unpaidLeaveDays * perDaySalary);

    return leaveDeduction;
};

/**
 * Get leave policy for a company
 * Default policy if not configured
 */
const getLeavePolicy = (company) => {
    if (company && company.leavePolicy) {
        return {
            casual: company.leavePolicy.casual || 12,
            sick: company.leavePolicy.sick || 8,
            earned: company.leavePolicy.earned || 16,
            paid: company.leavePolicy.paid || 0,
        };
    }

    // Default policy
    return {
        casual: 12,   // 12 casual days per year
        sick: 8,      // 8 sick days per year
        earned: 16,   // 16 earned days per year
        paid: 0,      // No paid leaves (company configurable)
    };
};

module.exports = {
    getApprovedLeavesForMonth,
    calculateLeaveDeduction,
    getLeavePolicy,
};
