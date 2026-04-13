const Attendance = require("../models/Attendance");

/**
 * CENTRALIZED SALARY CALCULATOR - SaaS Level
 *
 * Single function used for:
 * - Preview calculation
 * - Payroll generation
 * - Payslip display
 *
 * Ensures consistency across all features
 */

/**
 * Calculate complete payroll for an employee
 *
 * @param {Object} employee - Employee document
 * @param {string} month - Month name (e.g., "January", "March")
 * @param {number} year - Year (e.g., 2026)
 * @param {number} bonusOverride - Optional bonus amount (default: 0)
 * @returns {Object} Complete payroll breakdown
 */
const calculateSalary = async (employee, month, year, bonusOverride = 0) => {
    if (!employee || !employee.salary || employee.salary <= 0) {
        throw new Error(`Employee has no valid salary configured`);
    }

    const basicSalary = employee.salary;
    const workingDays = 26;

    const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
    const startDate = new Date(year, monthIndex, 1);
    const endDate = new Date(year, monthIndex + 1, 0, 23, 59, 59);

    const attendanceRecords = await Attendance.find({
        employee: employee._id,
        date: { $gte: startDate, $lte: endDate },
    });

    const presentFullDays = attendanceRecords.filter(a =>
        a.status === "Present" || a.status === "Overtime"
    ).length;

    const overtimeDays = attendanceRecords.filter(a => a.status === "Overtime").length;
    const halfDays = attendanceRecords.filter(a => a.status === "Half Day").length;
    const absentDays = attendanceRecords.filter(a => a.status === "Absent").length;
    const lateDays = attendanceRecords.filter(a => a.isLate === true).length;

    const presentDays = presentFullDays + (halfDays * 0.5);

    if (absentDays < 0 || absentDays > workingDays) {
        throw new Error(`Invalid absentDays for ${employee.name}`);
    }

    if (presentDays + absentDays > workingDays) {
        throw new Error(`Attendance totals exceed working days for ${employee.name}`);
    }

    const hra = Math.round(basicSalary * 0.20);
    const allowances = Math.round(basicSalary * 0.10);
    const bonus = bonusOverride || 0;

    const grossPay = basicSalary + hra + allowances;

    const perDaySalary = basicSalary / workingDays;
    const leaveDeduction = Math.round(absentDays * perDaySalary);

    const pf = Math.round(basicSalary * 0.12);
    const tax = Math.round(basicSalary * 0.10);

    const totalDeductions = pf + tax + leaveDeduction;
    const netPay = Math.max(0, grossPay - totalDeductions);

    return {
        basicSalary,
        hra,
        allowances,
        grossPay,
        leaveDeduction,
        pf,
        tax,
        totalDeductions,
        netPay,
        workingDays,
        presentDays,
        absentDays,
        lateDays,
        overtimeDays,
        halfDays,
        bonus,
        perDaySalary,
    };
};

module.exports = {
    calculateSalary,
};
