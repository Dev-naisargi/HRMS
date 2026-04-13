const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Employee = require("../models/Employee");


// ✅ ADD EMPLOYEE (FULL FIX)
const addEmployee = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      department,
      designation,
      salary,
      phone,
      dob,
      doj,
      bankDetails
    } = req.body;
    // ✅ validation
    if (new Date(doj) < new Date(dob)) {
      return res.status(400).json({
        message: "DOJ cannot be before DOB",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ CREATE USER
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "EMPLOYEE",
      companyId: req.user.companyId,
      phone,   // ✅ ADD THIS
      dob,     // ✅ ADD THIS
      doj,     // ✅ ADD THIS
      department
    });

    let employee = null;

    // ✅ CREATE EMPLOYEE
    if (user.role === "EMPLOYEE") {
      employee = await Employee.create({
        name,              // ✅ ADD THIS
        email,             // ✅ ADD THIS
        phone,             // ✅ ADD THIS

        userId: user._id,
        companyId: req.user.companyId,

        department,
        designation,
        salary,
        dob,
        doj,
        bankDetails,
      });
    }

    res.status(201).json({
      message: "Employee created successfully",
      user,
      employee,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ✅ GET EMPLOYEES (SAFE POPULATE)
const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({
      companyId: req.user.companyId,
    });

    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ✅ UPDATE EMPLOYEE (SYNC BOTH MODELS)
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      email,
      dob,
      doj,
      phone,
      department,
      designation,
      salary,
      bankDetails,
    } = req.body;

    const employee = await Employee.findOne({
      _id: id,
      companyId: req.user.companyId,
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // ✅ update USER
    await User.findByIdAndUpdate(employee.userId, {
      name,
      phone,
      email,
      dob,
      doj,
      department,
    });

    // ✅ update EMPLOYEE
    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      {
        name,        // ✅ ADD THIS
        email,       // ✅ ADD THIS
        phone,
        department,
        designation,
        salary: salary || 0,
        dob,
        doj,
        bankDetails,
      },
      { new: true }
    );
    res.json(updatedEmployee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ✅ DELETE EMPLOYEE
const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findOneAndDelete({
      _id: id,
      companyId: req.user.companyId,
    });

    if (employee) {
      await User.findByIdAndDelete(employee.userId);
    }

    res.json({ message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  addEmployee,
  getEmployees,
  updateEmployee,
  deleteEmployee,
};