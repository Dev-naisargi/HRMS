const Payroll = require("../models/Payroll");
const User = require("../models/User");

// GET all payrolls for company
const getPayrolls = async (req, res) => {
  try {
    const employees = await User.find({
      role: "EMPLOYEE",
      company: req.user.companyId,
    }).select("-password");

    const currentMonth = new Date().toISOString().slice(0, 7);

    const payrolls = await Promise.all(
      employees.map(async (emp) => {
        let payroll = await Payroll.findOne({
          employee: emp._id,
          month: currentMonth,
        });

        if (!payroll) {
          payroll = await Payroll.create({
            employee: emp._id,
            company: req.user.companyId,
            basicSalary: 0,
            bonus: 0,
            deductions: 0,
            netPay: 0,
            month: currentMonth,
            status: "Pending",
          });
        }

        return {
          _id: payroll._id,
          employee: {
            _id: emp._id,
            name: emp.name,
            email: emp.email,
            department: emp.department,
          },
          basicSalary: payroll.basicSalary,
          bonus: payroll.bonus,
          deductions: payroll.deductions,
          netPay: payroll.netPay,
          month: payroll.month,
          status: payroll.status,
        };
      })
    );

    res.status(200).json({ payrolls });
  } catch (error) {
    console.error("Get Payrolls Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE payroll
const updatePayroll = async (req, res) => {
  try {
    const { basicSalary, bonus, deductions, status } = req.body;
    const netPay = Number(basicSalary) + Number(bonus) - Number(deductions);

    const updated = await Payroll.findByIdAndUpdate(
      req.params.id,
      { basicSalary, bonus, deductions, netPay, status },
      { new: true }
    ).populate("employee", "name email department");

    res.status(200).json({ message: "Payroll updated", payroll: updated });
  } catch (error) {
    console.error("Update Payroll Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getPayrolls, updatePayroll };