const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// 🔗 connect DB
mongoose.connect("mongodb://127.0.0.1:27017/Project-HRMS");

const seedSuperAdmin = async () => {
  try {
    const existing = await User.findOne({ email: "superadmin@gmail.com" });

    if (existing) {
      console.log("⚠️ Super Admin already exists");
      process.exit();
    }

    const hashedPassword = await bcrypt.hash("12345678", 10);

    await User.create({
      name: "Super Admin",
      email: "superadmin@gmail.com",
      password: hashedPassword,
      role: "SUPER_ADMIN",
    });

    console.log("✅ Super Admin created successfully");
    process.exit();

  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

seedSuperAdmin();