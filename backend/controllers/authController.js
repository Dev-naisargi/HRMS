const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Company = require("../models/Company");
const Employee = require("../models/Employee");

const PHONE_REGEX = /^[0-9]{10}$/;
const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&^()\-_=+{};:,./\\|~`[\]<>])[A-Za-z\d@$!%*?#&^()\-_=+{};:,./\\|~`[\]<>]{8,}$/;

const normalizeString = (value) => (typeof value === "string" ? value.trim() : value);
const normalizeDateValue = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const registerCompany = async (req, res) => {
  try {
const { name, address, adminEmail, password } = req.body;    
    const existingCompany = await Company.findOne({ name});
    if (existingCompany) return res.status(400).json({ message: "Company already registered" });

    const existingUser = await User.findOne({ email: adminEmail });
    if (existingUser) return res.status(400).json({ message: "Email already registered" });

   const company = await Company.create({
  name,
  address,
  adminEmail,
  status: "PENDING"
});

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await User.create({
      name: "Admin",
      email: adminEmail,
      password: hashedPassword,
      role: "ADMIN",
      companyId: company._id
    });

    

    res.status(201).json({ message: "Company registration pending approval", company, admin });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate("companyId");

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // ✅ HANDLE OLD + NEW PASSWORDS
    let isMatch = false;

    if (
      user.password.startsWith("$2a$") ||
      user.password.startsWith("$2b$")
    ) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      // plain text password (old data)
      isMatch = password === user.password;

      // 🔥 AUTO CONVERT TO HASHED
      if (isMatch) {
        const hashed = await bcrypt.hash(password, 10);
        user.password = hashed;
        await user.save();
      }
    }

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // ✅ SAFE ROLE HANDLING
    const role = user.role || "EMPLOYEE";

    // ✅ SAFE COMPANY CHECK
    if (role !== "SUPER_ADMIN") {
      if (!user.companyId) {
        return res.status(403).json({ message: "Company not assigned" });
      }

      // allow login if status missing (old data)
      if (
        user.companyId.status &&
        user.companyId.status !== "APPROVED"
      ) {
        return res.status(403).json({
          message: `Company is ${user.companyId.status}`,
        });
      }
    }

    // ✅ GENERATE TOKEN
    const token = jwt.sign(
      {
        id: user._id,
        role: role,
        companyId: user.companyId?._id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        role: role,
        companyId: user.companyId?._id,
      },
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password").populate("companyId");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id).select("_id role");
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const allowedFieldMap = {
      SUPER_ADMIN: ["name", "phone"],
      ADMIN: ["name", "phone"],
      HR: ["name", "phone"],
      EMPLOYEE: ["name", "phone", "dob"],
    };

    const allowedFields = allowedFieldMap[currentUser.role] || ["name"];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body.hasOwnProperty(field) && req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (!Object.keys(updates).length) {
      return res.status(400).json({ message: "No valid profile fields provided" });
    }

    if (updates.name !== undefined) {
      updates.name = normalizeString(updates.name);
      if (!updates.name) {
        return res.status(400).json({ message: "Name is required" });
      }
      if (updates.name.length > 80) {
        return res.status(400).json({ message: "Name is too long" });
      }
    }

    if (updates.phone !== undefined) {
      updates.phone = normalizeString(updates.phone);
      if (updates.phone && !PHONE_REGEX.test(updates.phone)) {
        return res.status(400).json({ message: "Phone must be exactly 10 digits" });
      }
    }

    if (updates.email !== undefined) {
      updates.email = normalizeString(updates.email)?.toLowerCase();
      if (!EMAIL_REGEX.test(updates.email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }
    }

    if (updates.dob !== undefined) {
      const normalizedDob = normalizeDateValue(updates.dob);
      if (!normalizedDob) {
        return res.status(400).json({ message: "Invalid date of birth" });
      }
      const now = new Date();
      if (normalizedDob > now) {
        return res.status(400).json({ message: "Date of birth cannot be in the future" });
      }
      updates.dob = normalizedDob;
    }

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    }).select("-password").populate("companyId");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (["EMPLOYEE", "HR"].includes(updatedUser.role)) {
      const employeePatch = {};
      if (updates.name !== undefined) employeePatch.name = updates.name;
      if (updates.phone !== undefined) employeePatch.phone = updates.phone;
      if (updates.dob !== undefined) employeePatch.dob = updates.dob;

      if (Object.keys(employeePatch).length) {
        await Employee.findOneAndUpdate(
          { userId: updatedUser._id },
          { $set: employeePatch },
          { new: false }
        );
      }
    }

    res.json({ user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All password fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New password and confirm password do not match" });
    }

    if (!PASSWORD_REGEX.test(newPassword)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ message: "New password must be different from current password" });
    }

    const user = await User.findById(req.user.id).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let isCurrentPasswordValid = false;
    if (user.password.startsWith("$2a$") || user.password.startsWith("$2b$")) {
      isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    } else {
      isCurrentPasswordValid = currentPassword === user.password;
    }

    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({ message: "Password updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { registerCompany, login, getMe, updateProfile, changePassword };
