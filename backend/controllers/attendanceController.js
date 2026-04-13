const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");

/* ── Helper: get today's date range ── */
const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

/* ── Helper: find employee by userId ── */
const findEmployee = async (userId) => {
  return await Employee.findOne({ userId });
};

/* ── Helper: check if today is a weekend ── */
const isWeekend = () => {
  const day = new Date().getDay(); // 0 = Sunday, 6 = Saturday
  return day === 0 || day === 6;
};

/* ===============================
   ✅ CHECK IN
================================ */
const checkIn = async (req, res) => {
  try {
    // ── Block weekends ──
    if (isWeekend()) {
      return res.status(400).json({
        message: "Check-in not allowed on weekends (Saturday & Sunday).",
      });
    }

    const now = new Date();
    const { start, end } = getTodayRange();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const employee = await findEmployee(req.user.userId);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    // Prevent duplicate check-in
    const existing = await Attendance.findOne({
      employee: employee._id,
      date: { $gte: start, $lte: end },
    });

    if (existing) {
      if (existing.checkIn && !existing.checkOut) {
        return res.status(400).json({ message: "Already checked in." });
      }
      return res.status(400).json({ message: "Attendance already marked for today." });
    }

    // Office timings
    const startTime = new Date();
    startTime.setHours(9, 0, 0, 0);

    const lateTime = new Date();
    lateTime.setHours(9, 15, 0, 0);

    const endTime = new Date();
    endTime.setHours(18, 30, 0, 0);

    if (now < startTime) {
      return res.status(400).json({ message: "Check-in is not allowed before working hours (9:00 AM)." });
    }

    if (now > endTime) {
      return res.status(400).json({ message: "Check-in time is over for today." });
    }

    const attendance = await Attendance.create({
      employee: employee._id,
      date: today,
      checkIn: now,
      isLate: now > lateTime,
      status: "Present",
      stampStatus: "checked_in",
    });

    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ===============================
   🟡 BREAK START
================================ */
const breakStart = async (req, res) => {
  try {
    const { start, end } = getTodayRange();

    const employee = await findEmployee(req.user.userId);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    const attendance = await Attendance.findOne({
      employee: employee._id,
      date: { $gte: start, $lte: end },
    });

    if (!attendance || !attendance.checkIn) {
      return res.status(400).json({ message: "Please check in first." });
    }
    if (attendance.checkOut) {
      return res.status(400).json({ message: "You have already checked out." });
    }
    if (attendance.stampStatus === "on_break") {
      return res.status(400).json({ message: "Already on break." });
    }
    if (!["checked_in", "resumed"].includes(attendance.stampStatus)) {
      return res.status(400).json({ message: "Cannot start break right now." });
    }

    attendance.breakStart = new Date();
    attendance.stampStatus = "on_break";
    await attendance.save();

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ===============================
   🟢 BREAK END (RESUME)
================================ */
const breakEnd = async (req, res) => {
  try {
    const { start, end } = getTodayRange();

    const employee = await findEmployee(req.user.userId);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    const attendance = await Attendance.findOne({
      employee: employee._id,
      date: { $gte: start, $lte: end },
    });

    if (!attendance || !attendance.breakStart) {
      return res.status(400).json({ message: "No active break found." });
    }
    if (attendance.stampStatus !== "on_break") {
      return res.status(400).json({ message: "Not currently on break." });
    }

    const now = new Date();
    const breakMins = Math.round((now - new Date(attendance.breakStart)) / (1000 * 60));

    attendance.breakEnd = now;
    attendance.breakMinutes = (attendance.breakMinutes || 0) + breakMins;
    attendance.stampStatus = "resumed";
    await attendance.save();

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ===============================
   🔴 CHECK OUT
================================ */
const checkOut = async (req, res) => {
  try {
    const now = new Date();
    const { start, end } = getTodayRange();

    const employee = await findEmployee(req.user.userId);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    const attendance = await Attendance.findOne({
      employee: employee._id,
      date: { $gte: start, $lte: end },
    });

    if (!attendance || !attendance.checkIn) {
      return res.status(400).json({ message: "Please check in first." });
    }
    if (attendance.checkOut) {
      return res.status(400).json({ message: "Already checked out." });
    }
    if (attendance.stampStatus === "on_break") {
      return res.status(400).json({ message: "Please resume from break before checking out." });
    }

    attendance.checkOut = now;

    // Total raw hours
    const rawHours = (now - new Date(attendance.checkIn)) / (1000 * 60 * 60);

    // Subtract break time
    const breakHours = (attendance.breakMinutes || 0) / 60;
    const netHours = rawHours - breakHours;

    attendance.workingHours = Number(netHours.toFixed(2));
    attendance.stampStatus = "checked_out";

    // Status logic based on net working hours
    if (netHours < 4) {
      attendance.status = "Half Day";
    } else if (netHours > 9) {
      attendance.status = "Overtime";
    } else {
      attendance.status = "Present";
    }

    await attendance.save();
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ===============================
   ✅ GET MY ATTENDANCE
================================ */
const getMyAttendance = async (req, res) => {
  try {
    const employee = await findEmployee(req.user.userId);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    const records = await Attendance.find({ employee: employee._id }).sort({ date: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ===============================
   ✅ HR - GET ALL ATTENDANCE
================================ */
const getAllAttendance = async (req, res) => {
  try {
    const employees = await Employee.find({ companyId: req.user.companyId }).select("_id");
    const empIds = employees.map((e) => e._id);

    const records = await Attendance.find({ employee: { $in: empIds } })
      .populate("employee", "name department")
      .sort({ date: -1 });

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  checkIn,
  breakStart,
  breakEnd,
  checkOut,
  getMyAttendance,
  getAllAttendance,
};