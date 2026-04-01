const Payroll    = require("../models/Payroll");
const Employee   = require("../models/Employee");
const Attendance = require("../models/Attendance");
const Company    = require("../models/Company");
const { calculateSalary } = require("../utils/salaryCalculator");
const { calculateLeaveDeduction } = require("../utils/leaveCalculator");

/* ══════════════════════════════════════════════════
   HELPER: Calculate payroll for one employee
   Uses real attendance data + approved leaves from DB
   Centralized calculation for consistency
══════════════════════════════════════════════════ */
const calculatePayroll = async (employee, month, year, bonusOverride = 0) => {
    // ── Fetch company salary structure ──
    const company = await Company.findById(employee.companyId);
    if (!company) {
        throw new Error("Company not found");
    }

    const salaryStructure = company.salaryStructure || {
        hraPercent: 20,
        allowancePercent: 10,
        pfPercent: 12,
        taxPercent: 10,
        overtimeRateMultiplier: 1.5,
        latePenaltyPerDay: 100,
        workingDaysPerMonth: 26,
    };

    // ── Month date range ──
    const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
    const startDate  = new Date(year, monthIndex, 1);
    const endDate    = new Date(year, monthIndex + 1, 0, 23, 59, 59);

    // ── Fetch attendance for this employee this month ──
    const attendanceRecords = await Attendance.find({
        employee: employee._id,
        date: { $gte: startDate, $lte: endDate },
    });

    // ── Count attendance stats ──
    const presentDays  = attendanceRecords.filter(a =>
        a.status === "Present" || a.status === "Overtime"
    ).length;
    const overtimeDays = attendanceRecords.filter(a => a.status === "Overtime").length;
    const lateDays     = attendanceRecords.filter(a => a.isLate === true).length;
    const halfDays     = attendanceRecords.filter(a => a.status === "Half Day").length;
    const absentDays   = Math.max(0, salaryStructure.workingDaysPerMonth - presentDays - halfDays);

    // ── Calculate leave deduction from approved leaves ──
    const leaveData = await calculateLeaveDeduction({
        employeeId: employee._id,
        month,
        year,
        monthlySalary: employee.salary || 0,
        workingDaysPerMonth: salaryStructure.workingDaysPerMonth,
        company,
    });

    // ── Use centralized salary calculator ──
    const calculation = calculateSalary({
        monthlySalary: employee.salary || 0,
        presentDays,
        absentDays,
        lateDays,
        halfDays,
        overtimeDays,
        bonus: bonusOverride,
        leaveDeduction: leaveData.leaveDeduction, // Use calculated leave deduction
        salaryStructure,
    });

    // ── Attach leave details to calculation ──
    calculation.leaveDetails = leaveData;

    return calculation;
};

/* ══════════════════════════════════════════════════
   ✅ GENERATE PAYROLL (DRAFT)
   HR clicks "Generate Payroll" for a month
══════════════════════════════════════════════════ */
const generatePayroll = async (req, res) => {
    try {
        const { month, year, bonusList = [] } = req.body;
        // bonusList: [{ employeeId, bonus }] — optional HR overrides
        const companyId = req.user.companyId;

        if (!month || !year) {
            return res.status(400).json({ message: "Month and year are required." });
        }

        // ── Fetch all employees in company ──
        let employees = await Employee.find({ companyId });
        if (req.body.employeeId) {
            employees = employees.filter(e => e._id.toString() === req.body.employeeId);
        }
        if (employees.length === 0) {
            return res.status(400).json({ message: "No employees found in company." });
        }

        const results   = [];
        const skipped   = [];

        for (const emp of employees) {
            // Skip if already generated for this employee this month
            const existing = await Payroll.findOne({
                companyId, month, year, employeeId: emp._id
            });
            if (existing) {
                skipped.push(emp.name);
                continue;
            }

            // Get bonus override for this employee if HR provided one
            const bonusEntry  = bonusList.find(b => b.employeeId === emp._id.toString());
            const bonusAmount = bonusEntry ? bonusEntry.bonus : 0;

            // Calculate payroll using real attendance
            const calc = await calculatePayroll(emp, month, year, bonusAmount);

            const payroll = await Payroll.create({
                employeeId: emp._id,
                companyId,
                month,
                year,
                ...calc,
                workingDays: calc.workingDaysPerMonth,
                status: 'DRAFT',
            });

            results.push(payroll);
        }

        res.status(201).json({
            message: `Payroll generated for ${results.length} employees.`,
            skipped: skipped.length > 0 ? `Already exists for: ${skipped.join(', ')}` : null,
            payrolls: results,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* ══════════════════════════════════════════════════
   ✅ GET PAYROLL PREVIEW (before generating)
   HR can preview salary breakdown before confirming
══════════════════════════════════════════════════ */
const getPayrollPreview = async (req, res) => {
    try {
        const { month, year } = req.query;
        const companyId = req.user.companyId;

        if (!month || !year) {
            return res.status(400).json({ message: "Month and year are required." });
        }

        let employees = await Employee.find({ companyId });
        if (req.query.employeeId) {
            employees = employees.filter(e => e._id.toString() === req.query.employeeId);
        }
        const previews  = [];

        for (const emp of employees) {
            const calc = await calculatePayroll(emp, month, parseInt(year));
            previews.push({
                employeeId:  emp._id,
                name:        emp.name,
                department:  emp.department,
                designation: emp.designation,
                ...calc,
            });
        }

        const totalPayable = previews.reduce((sum, p) => sum + p.netPay, 0);

        res.json({
            month,
            year,
            totalEmployees: previews.length,
            totalPayable,
            previews,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* ══════════════════════════════════════════════════
   ✅ GET ALL PAYROLLS (HR/Admin view)
   Employee sees only their own
══════════════════════════════════════════════════ */
const getPayrolls = async (req, res) => {
    try {
        const query = { companyId: req.user.companyId };

        if (req.query.month) query.month = req.query.month;
        if (req.query.year)  query.year  = parseInt(req.query.year);

        // Employee sees only their own payroll
        if (req.user.role === 'EMPLOYEE') {
            const employee = await Employee.findOne({ userId: req.user.userId });
            if (!employee) return res.status(404).json({ message: "Employee not found" });
            query.employeeId = employee._id;
        }

        const payrolls = await Payroll.find(query)
            .populate('employeeId', 'name email department designation salary')
            .sort({ year: -1, createdAt: -1 });

        // ── Stats for HR dashboard ──
        const totalDisbursement = payrolls
            .filter(p => p.status === 'PAID')
            .reduce((sum, p) => sum + p.netPay, 0);

        const pendingApprovals = payrolls.filter(p => p.status === 'PENDING').length;

        res.json({
            payrolls,
            stats: {
                totalDisbursement,
                pendingApprovals,
                totalRecords: payrolls.length,
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* ══════════════════════════════════════════════════
   ✅ SUBMIT PAYROLL (DRAFT → PENDING)
══════════════════════════════════════════════════ */
const submitPayroll = async (req, res) => {
    try {
        const { id } = req.params;
        const payroll = await Payroll.findOneAndUpdate(
            { _id: id, companyId: req.user.companyId, status: 'DRAFT' },
            { status: 'PENDING', submittedBy: req.user.id, submittedAt: new Date() },
            { new: true }
        );
        if (!payroll) return res.status(404).json({ message: "Draft payroll not found." });
        res.json({ message: "Payroll submitted for approval.", payroll });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* ══════════════════════════════════════════════════
   ✅ APPROVE PAYROLL (PENDING → APPROVED)
══════════════════════════════════════════════════ */
const approvePayroll = async (req, res) => {
    try {
        const { id } = req.params;
        const payroll = await Payroll.findOneAndUpdate(
            { _id: id, companyId: req.user.companyId, status: 'PENDING' },
            { status: 'APPROVED', approvedBy: req.user.id, approvedAt: new Date() },
            { new: true }
        );
        if (!payroll) return res.status(404).json({ message: "Pending payroll not found." });
        res.json({ message: "Payroll approved.", payroll });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* ══════════════════════════════════════════════════
   ✅ REJECT PAYROLL (PENDING → REJECTED)
══════════════════════════════════════════════════ */
const rejectPayroll = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const payroll = await Payroll.findOneAndUpdate(
            { _id: id, companyId: req.user.companyId, status: 'PENDING' },
            { status: 'REJECTED', rejectionReason: reason || "No reason provided" },
            { new: true }
        );
        if (!payroll) return res.status(404).json({ message: "Pending payroll not found." });
        res.json({ message: "Payroll rejected.", payroll });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* ══════════════════════════════════════════════════
   ✅ MARK AS PAID (APPROVED → PAID)
══════════════════════════════════════════════════ */
const payPayroll = async (req, res) => {
    try {
        const { id } = req.params;
        const payroll = await Payroll.findOneAndUpdate(
            { _id: id, companyId: req.user.companyId, status: 'APPROVED' },
            { status: 'PAID', paidBy: req.user.id, paidAt: new Date() },
            { new: true }
        );
        if (!payroll) return res.status(404).json({ message: "Approved payroll not found." });
        res.json({ message: "Payroll marked as paid.", payroll });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* ══════════════════════════════════════════════════
   ✅ GET PAYSLIP (single record with full details)
══════════════════════════════════════════════════ */
const getPayslip = async (req, res) => {
    try {
        const { id } = req.params;
        const query = { _id: id, companyId: req.user.companyId };

        if (req.user.role === 'EMPLOYEE') {
            const employee = await Employee.findOne({ userId: req.user.userId });
            if (!employee) return res.status(404).json({ message: "Employee not found" });
            query.employeeId = employee._id;
        }

        const payroll = await Payroll.findOne(query)
            .populate('employeeId',  'name email department designation salary phone')
            .populate('submittedBy', 'name')
            .populate('approvedBy',  'name')
            .populate('paidBy',      'name');

        if (!payroll) return res.status(404).json({ message: "Payslip not found." });
        res.json({ payroll });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    generatePayroll,
    getPayrollPreview,
    getPayrolls,
    submitPayroll,
    approvePayroll,
    rejectPayroll,
    payPayroll,
    getPayslip,
};