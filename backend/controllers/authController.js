// controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // 2️⃣ find user
    const user = await User.findOne({ email }).populate("company");
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 3️⃣ allow only ADMIN here
    const role = user.role.toLowerCase();
    if (role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // 4️⃣ compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 5️⃣ generate token
    const token = jwt.sign(
      {
        userId: user._id,
        role,
        companyId: user.company._id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 6️⃣ response
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role,
        company: user.company.companyName,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const logout = async (req, res) => {
  try {
    // for JWT, logout is client-side
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Logout failed" });
  }
};

module.exports = {
  loginAdmin,
  logout
};
