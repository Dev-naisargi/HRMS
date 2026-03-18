const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Attendance = require("../models/Attendance");
const Leave = require("../models/Leave");
exports.getChartData = async (req, res) => {
  try {

    /*  ATTENDANCE  */

    const present = await Attendance.countDocuments({
      status: "Present"
    });

    const absent = await Attendance.countDocuments({
      status: "Absent"
    });

    // Late logic (handles both cases)
    const late = await Attendance.countDocuments({
      $or: [
        { status: "Late" },
        { isLate: true }
      ]
    });

    /*  LEAVES  */

    const approved = await Leave.countDocuments({
      status: "Approved"
    });

    const pending = await Leave.countDocuments({
      status: "Pending"
    });

    const rejected = await Leave.countDocuments({
      status: "Rejected"
    });

    res.json({
      attendance: { present, absent, late },
      leaves: { approved, pending, rejected },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Chart error" });
  }
};

// GET all HRs of this company
exports.getHRs = async (req, res) => {
  try {
    const hrs = await User.find({
      role: "HR",
      company: req.user.companyId,
    }).select("-password");

    res.status(200).json({ hrs });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE HR
exports.updateHR = async (req, res) => {
  try {
    const { name, phone, department, dob, doj } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { name, phone, department, dob, doj },
      { new: true },
    ).select("-password");
if (phone && !/^\d{10}$/.test(phone)) {
  return res.status(400).json({ message: "Phone must be 10 digits" });
}

if (dob && new Date(dob) >= new Date()) {
  return res.status(400).json({ message: "DOB must be past" });
}

if (doj && dob && new Date(doj) <= new Date(dob)) {
  return res.status(400).json({ message: "DOJ must be after DOB" });
}
    if (!updated) return res.status(404).json({ message: "HR not found" });

    res.status(200).json({ message: "HR updated", hr: updated });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE HR
exports.deleteHR = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "HR deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
exports.createHR = async (req, res) => {
  try {
    const { name, email, password, phone, department, dob, doj } = req.body;

    // REGEX
    const nameRegex = /^[A-Za-z\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;
    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/;

    const today = new Date();

    // REQUIRED
    if (!name || !email || !password || !phone || !department || !dob || !doj) {
      return res.status(400).json({ message: "All fields required" });
    }

    // NAME
    if (!nameRegex.test(name)) {
      return res.status(400).json({ message: "Invalid name" });
    }

    // EMAIL
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // PHONE
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: "Phone must be 10 digits" });
    }

    // PASSWORD
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: "Password must be strong (8+ chars, number, symbol)",
      });
    }

    // DOB VALIDATION
    const dobDate = new Date(dob);
    if (dobDate >= today) {
      return res.status(400).json({ message: "DOB must be in past" });
    }

    const age = today.getFullYear() - dobDate.getFullYear();
    if (age < 18) {
      return res.status(400).json({ message: "HR must be at least 18 years old" });
    }

    // DOJ VALIDATION
    const dojDate = new Date(doj);

    if (dojDate > today) {
      return res.status(400).json({ message: "DOJ cannot be future" });
    }

    if (dojDate <= dobDate) {
      return res.status(400).json({ message: "DOJ must be after DOB" });
    }

    // CHECK EXISTING
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "HR already exists" });
    }

    // HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    // CREATE HR
    const newHR = await User.create({
      name: name.trim(),
      email: email.trim(),
      password: hashedPassword,
      role: "HR",
      company: req.user.companyId,
      phone,
      department,
      dob,
      doj,
    });

    res.status(201).json({
      message: "HR created successfully",
      hr: newHR,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
// GET STATS
exports.getStats = async (req, res) => {
  try {
    const totalHR = await User.countDocuments({
      role: "HR",
      company: req.user.companyId,
    });
    const totalEmployees = await User.countDocuments({
      role: "EMPLOYEE",
      company: req.user.companyId,
    });
    const deptData = await User.distinct("department", {
      company: req.user.companyId,
    });
    const departments = deptData.filter(Boolean).length;

    res.status(200).json({
      totalHR,
      totalEmployees,
      departments,
      pendingLeaves: 0,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

