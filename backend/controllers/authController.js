const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const Company = require("../models/Company");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/* =========================
   REGISTER ADMIN + COMPANY
========================= */
const registerAdmin = async (req, res) => {
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

    // ✅ REGEX
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const nameRegex = /^[A-Za-z\s]+$/;
    const phoneRegex = /^\d{10}$/;
    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/;

    // ✅ TRIM INPUT
    const trimmedData = {
      companyName: companyName?.trim(),
      companyAddress: companyAddress?.trim(),
      companyPhone: companyPhone?.trim(),
      adminName: adminName?.trim(),
      adminEmail: adminEmail?.trim(),
      password,
      confirmPassword,
    };

    // ✅ REQUIRED
    if (
      !trimmedData.companyName ||
      !trimmedData.companyAddress ||
      !trimmedData.companyPhone ||
      !trimmedData.adminName ||
      !trimmedData.adminEmail ||
      !trimmedData.password ||
      !trimmedData.confirmPassword
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ NAME VALIDATION
    if (!nameRegex.test(trimmedData.companyName)) {
      return res.status(400).json({ message: "Invalid company name" });
    }

    if (!nameRegex.test(trimmedData.adminName)) {
      return res.status(400).json({ message: "Invalid admin name" });
    }

    // ✅ PHONE VALIDATION
    if (!phoneRegex.test(trimmedData.companyPhone)) {
      return res.status(400).json({
        message: "Phone number must be exactly 10 digits",
      });
    }

    // ✅ EMAIL VALIDATION
    if (!emailRegex.test(trimmedData.adminEmail)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // ✅ PASSWORD STRENGTH
    if (!passwordRegex.test(trimmedData.password)) {
      return res.status(400).json({
        message:
          "Password must be 8+ chars with letter, number & special character",
      });
    }

    // ✅ PASSWORD MATCH
    if (trimmedData.password !== trimmedData.confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // ✅ CHECK EXISTING USER
    const existingUser = await User.findOne({
      email: trimmedData.adminEmail,
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // ✅ CREATE COMPANY
    const company = await Company.create({
      companyName: trimmedData.companyName,
      companyAddress: trimmedData.companyAddress,
      companyPhone: trimmedData.companyPhone,
      status: "Pending", // ✅ important
    });
    const hashedPassword = await bcrypt.hash(trimmedData.password, 10);

    // ✅ CREATE ADMIN
    const admin = await User.create({
      name: trimmedData.adminName,
      email: trimmedData.adminEmail,
      password: hashedPassword,
      role: "ADMIN",
      company: company._id,
    });

    res.status(201).json({
      message: "Company registered successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });

  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   UNIFIED LOGIN (Admin + HR + Employee)
========================= */
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email }).populate("company");
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });
    // ✅ BLOCK LOGIN IF COMPANY NOT APPROVED
    if (
      user.role !== "SUPER_ADMIN" &&
      user.company &&
      user.company.status !== "Approved"
    ) {
      return res.status(403).json({
        message: "Your company is not approved yet. Please wait for Super Admin approval.",
      });
    }

    // Allow ADMIN, HR and EMPLOYEE to login
    if (!["SUPER_ADMIN", "ADMIN", "HR", "EMPLOYEE"].includes(user.role))
      return res.status(403).json({ message: "Access denied" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user._id, role: user.role, companyId: user.company?._id || user.company },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    res.status(200).json({
      message: "Login successful",
      token,
      role: user.role,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company?.companyName || null,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   GOOGLE LOGIN
========================= */
const googleLoginAdminSimple = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential)
      return res.status(400).json({ message: "Google credential required" });

    const ticket = await client.verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID });
    const { email, name } = ticket.getPayload();

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ name, email, password: "google-auth", role: "ADMIN" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role, companyId: user.company },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Google login successful",
      token,
      role: user.role,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Google Login Error:", error);
    res.status(500).json({ message: "Google login failed" });
  }
};

/* =========================
   GET PROFILE
========================= */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password").populate("company");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   UPDATE PROFILE
========================= */
const updateProfile = async (req, res) => {
  try {
    const { name, phone, department, dob } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.user.userId,
      { name, phone, department, dob },
      { new: true }
    ).select("-password").populate("company");
    res.status(200).json({ message: "Profile updated", user: updated });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   LOGOUT
========================= */
const logout = async (req, res) => {
  res.status(200).json({ message: "Logged out successfully" });
};

module.exports = { registerAdmin, loginAdmin, googleLoginAdminSimple, logout, getMe, updateProfile };