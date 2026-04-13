const Company = require("../models/Company");


// ✅ REGISTER COMPANY
const registerCompany = async (req, res) => {
  try {
    const { name, address, email, phone, industry, adminEmail } = req.body;

    // 🔍 Case-insensitive check
    const existingCompany = await Company.findOne({
      name: { $regex: `^${name.trim()}$`, $options: "i" },
    });

    if (existingCompany) {
      return res.status(400).json({
        success: false,
        message: "Company name is already registered. Please use a different name.",
      });
    }

    const company = new Company({
      name: name.trim(),
      address,
      email,
      phone,
      industry,
      adminEmail,
    });

    await company.save();
     res.status(201).json({
      success: true,
      message: "Company registered successfully",
      data: company,
    });
  } catch (error) {
    console.error(error);

    // 🔥 Handle duplicate key error (backup safety)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Company name is already registered. Please use a different name.",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find();
    res.json(companies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCompanyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const company = await Company.findByIdAndUpdate(id, { status }, { new: true });
    res.json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;
    await Company.findByIdAndDelete(id);
    res.json({ message: "Company deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerCompany,getCompanies, updateCompanyStatus, deleteCompany };
