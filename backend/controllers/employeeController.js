const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Employee = require("../models/Employee");


// CREATE EMPLOYEE
const createEmployee = async (req, res) => {
  try {
    const {
      name, email, password, phone,
      department, dob, doj, status,
      position, salary
    } = req.body;

    // REGEX
    const nameRegex = /^[A-Za-z\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;
    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{6,}$/;

    const today = new Date();

    // ROLE CHECK
    if (req.user.role !== "HR") {
      return res.status(403).json({ message: "Only HR can create employees" });
    }

    // REQUIRED
    if (!name || !email || !password || !phone || !department || !dob || !doj || !position) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // NAME
    if (!nameRegex.test(name)) {
      return res.status(400).json({ message: "Invalid name (only letters allowed)" });
    }

    // EMAIL
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // PHONE
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: "Phone must be exactly 10 digits" });
    }

    // PASSWORD
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: "Password must be strong (min 6 chars, number & symbol)"
      });
    }

    // DOB
    const dobDate = new Date(dob);
    if (dobDate >= today) {
      return res.status(400).json({ message: "DOB must be in the past" });
    }

    const age = today.getFullYear() - dobDate.getFullYear();
    if (age < 18) {
      return res.status(400).json({ message: "Employee must be at least 18 years old" });
    }

    // DOJ
    const dojDate = new Date(doj);

    if (dojDate > today) {
      return res.status(400).json({ message: "Joining date cannot be in future" });
    }

    if (dojDate <= dobDate) {
      return res.status(400).json({ message: "Joining date must be after DOB" });
    }

    // SALARY (optional but validated)
    if (salary && salary < 0) {
      return res.status(400).json({ message: "Salary must be positive" });
    }

    // EXISTING USER
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Employee already exists" });
    }

    // HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    // CREATE USER
    const newUser = await User.create({
      name: name.trim(),
      email: email.trim(),
      password: hashedPassword,
      role: "EMPLOYEE",
      company: req.user.companyId,
      department,
    });

    // CREATE EMPLOYEE
    const newEmployee = await Employee.create({
      user: newUser._id,
      name,
      email,
      phone,
      department,
      position,
      salary,
      doj,
      dob,
      company: req.user.companyId,
      status: status || "Active",
    });

    res.status(201).json({
      message: "Employee created successfully",
      user: newUser,
      employee: newEmployee
    });

  } catch (error) {
    console.error("Create Employee Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET ALL EMPLOYEES
const getEmployees = async (req, res) => {
  try {
    if (req.user.role !== "HR" && req.user.role !== "ADMIN") {
  return res.status(403).json({ message: "Not authorized" });
}

    const employees = await Employee.find({
      company: req.user.companyId,
    });

    res.status(200).json({
      message: "Employees fetched successfully",
      count: employees.length,
      employees,
    });

  } catch (error) {
    console.error("Get Employees Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE EMPLOYEE
const updateEmployee = async (req, res) => {
  try {

    const { name, email, phone, department, position, salary, doj ,dob} = req.body;

    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Update Employee collection
    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params.id,
      {
        name,
        email,
        phone,
        department,
        position,
        salary,
        doj,
        dob
      },
      { new: true, runValidators: true }
    );

    // Update User collection (important for Leave module)
    await User.findByIdAndUpdate(employee.user, {
      name,
      email,
      department
    });

    res.status(200).json({
      message: "Employee updated successfully",
      employee: updatedEmployee
    });

  } catch (error) {
    console.error("Update Employee Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE EMPLOYEE
const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.status(200).json({ message: "Employee deleted successfully" });

  } catch (error) {
    console.error("Delete Employee Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { createEmployee, getEmployees, updateEmployee, deleteEmployee };