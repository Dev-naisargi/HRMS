const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");

/*  CHECK IN  */

const checkIn = async (req, res) => {
  try {
    const now = new Date();

    //  HOLIDAY CHECK (Sunday)
    const day = now.getDay(); // 0 = Sunday

    if (day === 0) {
      return res.status(400).json({
        message: "Today is a holiday (Sunday). Check-in not allowed.",
      });
    }

    // OFFICE TIME CHECK
    const officeStart = new Date();
    officeStart.setHours(9, 0, 0, 0); // 9:00 AM

    const officeEnd = new Date();
    officeEnd.setHours(18, 0, 0, 0); // 6:00 PM

    if (now < officeStart) {
      return res.status(400).json({
        message: "Office has not started yet.",
      });
    }

    if (now > officeEnd) {
      return res.status(400).json({
        message: "Office hours are over. Check-in not allowed.",
      });
    }

    //  NORMAL FLOW 
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const employee = await Employee.findOne({ user: req.user.userId });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const existing = await Attendance.findOne({
      employee: employee._id,
      date: today,
    });

    if (existing) {
      return res.status(400).json({
        message: "Already checked in today",
      });
    }

    const attendance = await Attendance.create({
      employee: employee._id,
      date: today,
      checkIn: now,
    });

    res.status(201).json(attendance);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
/*CHECK OUT */

const checkOut = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const employee = await Employee.findOne({ user: req.user.userId });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const attendance = await Attendance.findOne({
      employee: employee._id,
      date: today,
    });

    if (!attendance) {
      return res.status(404).json({ message: "Check-in not found" });
    }

    attendance.checkOut = new Date();

const hours =
  (attendance.checkOut - attendance.checkIn) / (1000 * 60 * 60);

attendance.workingHours = Number(hours.toFixed(2));

const officeStart = new Date(today);
officeStart.setHours(9, 15, 0, 0);

//  Late flag 
attendance.isLate = attendance.checkIn > officeStart;

// Payroll Status Logic
if (!attendance.checkIn) {
  attendance.status = "Absent";
}
else if (hours < 4) {
  attendance.status = "Half Day";
}
else if (hours > 9) {
  attendance.status = "Overtime";
}
else {
  attendance.status = "Present";
}

    await attendance.save();

    res.json(attendance);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
/*  GET MY ATTENDANCE */

const getMyAttendance = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user.userId });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const records = await Attendance.find({
      employee: employee._id,
    })
      .sort({ date: -1 });

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*  HR GET ALL  */

const getAllAttendance = async (req, res) => {
  try {
    const records = await Attendance.find()
      .populate("employee", "name department")
      .sort({ date: -1 });

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  checkIn,
  checkOut,
  getMyAttendance,
  getAllAttendance,
};