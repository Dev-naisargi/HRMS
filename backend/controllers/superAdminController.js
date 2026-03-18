const Company = require("../models/Company");
const User = require("../models/User");

// GET all companies (not just pending, for full dashboard stats)
exports.getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find({}).sort({ createdAt: -1 });
    res.json(companies);
  } catch (error) {
    res.status(500).json({ message: "Error fetching companies" });
  }
};

// GET system stats
exports.getSystemStats = async (req, res) => {
  try {
    const totalCompanies = await Company.countDocuments();
    const activeCompanies = await Company.countDocuments({ status: "Approved" });
    const pendingCompanies = await Company.countDocuments({ status: "Pending" });
    const totalHRs = await User.countDocuments({ role: "HR" });
    const totalEmployees = await User.countDocuments({ role: "EMPLOYEE" });

    res.json({
      totalCompanies,
      activeCompanies,
      pendingCompanies,
      totalHRs,
      totalEmployees,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching stats" });
  }
};

// GET all HRs
exports.getAllHRs = async (req, res) => {
  try {
    // Populate company to show which company they belong to
    const hrs = await User.find({ role: "HR" }).populate("company", "companyName").select("-password").sort({ createdAt: -1 });
    res.json(hrs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching HRs" });
  }
};

// GET all Employees
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: "EMPLOYEE" }).populate("company", "companyName").select("-password").sort({ createdAt: -1 });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: "Error fetching employees" });
  }
};

// APPROVE
exports.approveCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { status: "Approved" },
      { new: true }
    );
    res.json({ message: "Company approved", company });
  } catch (error) {
    res.status(500).json({ message: "Error approving company" });
  }
};

// REJECT
exports.rejectCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { status: "Rejected" },
      { new: true }
    );
    res.json({ message: "Company rejected", company });
  } catch (error) {
    res.status(500).json({ message: "Error rejecting company" });
  }
};