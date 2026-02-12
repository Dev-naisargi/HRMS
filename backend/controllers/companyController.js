// controllers/companyController.js
const bcrypt = require("bcryptjs");
const Company = require("../models/Company");
const User = require("../models/User");

const registerCompany = async (req, res) => {
  try {
    const {
      companyName,
      companyAddress,
      companyPhone,
      adminName,
      adminEmail,
      password,
      confirmPassword,
    } = req.body;

    if (!companyName || !adminEmail || !password) {
      return res.status(400).json({ message: "All required fields missing" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    // ✅ CREATE COMPANY (match schema)
    const company = await Company.create({
      companyName,
      companyAddress,
      companyPhone,
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ CREATE ADMIN
    await User.create({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: "ADMIN",
      company: company._id,
    });

    res.status(201).json({
      message: "Company and Admin registered successfully",
      companyId: company._id,
    });
  } catch (error) {
    console.error("Register company error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { registerCompany };
