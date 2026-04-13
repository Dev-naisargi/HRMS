/**
 * ============================================
 *  DUMMY EMPLOYEE + ATTENDANCE SEED SCRIPT
 *  Run once: node seed.js
 * ============================================
 */

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// ── Import Models ──
// Must have ../ not ./
const User = require("../models/User");
const Employee = require("../models/Employee");
const Attendance = require("../models/Attendance");

// ── You need a real companyId from your DB ──
// Run this in mongo shell to get it:
// db.companies.findOne()
// Then paste the _id below:
const COMPANY_ID = "698ec6e48733d51c39efd220"; // 👈 change this

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    // ── 1. Check if dummy user already exists ──
    const existingUser = await User.findOne({ email: "dummy.employee@test.com" });
    if (existingUser) {
      console.log("⚠️  Dummy employee already exists! Delete them first if you want to re-seed.");
      process.exit(0);
    }

    // ── 2. Create dummy User ──
    const hashedPassword = await bcrypt.hash("Test@1234", 10);
    const user = await User.create({
      name: "Rahul Sharma",
      email: "dummy.employee@test.com",
      password: hashedPassword,
      role: "EMPLOYEE",
      companyId: new mongoose.Types.ObjectId(COMPANY_ID),
      department: "Engineering",
      designation: "Software Developer",
      phone: "9876543210",
      dob: new Date("1995-06-15"),
      doj: new Date("2023-01-10"),
      status: "ACTIVE",
    });
    console.log("✅ Dummy User created:", user.email);

    // ── 3. Create dummy Employee ──
    const employee = await Employee.create({
      name: "Rahul Sharma",
      email: "dummy.employee@test.com",
      phone: "9876543210",
      userId: user._id,
      companyId: new mongoose.Types.ObjectId(COMPANY_ID),
      department: "Engineering",
      designation: "Software Developer",
      salary: 50000, // ₹50,000/month
      dob: new Date("1995-06-15"),
      doj: new Date("2023-01-10"),
    });
    console.log("✅ Dummy Employee created:", employee.name, "| Salary: ₹", employee.salary);

    // ── 4. Generate fake attendance for March 2026 ──
    const attendanceRecords = [];
    const month = 2; // 0-indexed: 2 = March
    const year = 2026;

    // Working days config
    const checkInHour = 9;
    const checkOutHour = 18;
    const lateThresholdMinutes = 15;

    for (let day = 1; day <= 31; day++) {
      const date = new Date(year, month, day);

      // Skip if not in March
      if (date.getMonth() !== month) break;

      const dayOfWeek = date.getDay();

      // Skip weekends (0=Sunday, 6=Saturday)
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;

      // Randomly mark 2 days as absent (day 5 and day 12)
      if (day === 5 || day === 12) {
        attendanceRecords.push({
          employee: employee._id,
          date: new Date(date.setHours(0, 0, 0, 0)),
          status: "Absent",
          stampStatus: "checked_out",
          isLate: false,
          workingHours: 0,
          breakMinutes: 0,
        });
        continue;
      }

      // Random check-in: sometimes late (after 9:15)
      const isLate = [3, 8, 15, 20].includes(day); // these days employee is late
      const checkInMinutes = isLate
        ? 20 + Math.floor(Math.random() * 30) // 9:20 to 9:50
        : Math.floor(Math.random() * 10);      // 9:00 to 9:10

      const checkIn = new Date(year, month, day, checkInHour, checkInMinutes, 0);

      // Break: 1:00 PM to 1:30 PM
      const breakStart = new Date(year, month, day, 13, 0, 0);
      const breakEnd = new Date(year, month, day, 13, 30, 0);
      const breakMinutes = 30;

      // Random check-out: 6:00 PM to 7:30 PM
      const isOvertime = [10, 18, 25].includes(day); // overtime days
      const checkOutMinutes = Math.floor(Math.random() * 30);
      const checkOutHourActual = isOvertime ? 19 : checkOutHour;
      const checkOut = new Date(year, month, day, checkOutHourActual, checkOutMinutes, 0);

      // Calculate net working hours
      const rawHours = (checkOut - checkIn) / (1000 * 60 * 60);
      const netHours = rawHours - breakMinutes / 60;

      // Determine status
      let status = "Present";
      if (netHours < 4) status = "Half Day";
      else if (netHours > 9) status = "Overtime";

      attendanceRecords.push({
        employee: employee._id,
        date: new Date(year, month, day, 0, 0, 0),
        checkIn,
        breakStart,
        breakEnd,
        breakMinutes,
        checkOut,
        workingHours: Number(netHours.toFixed(2)),
        isLate,
        status,
        stampStatus: "checked_out",
      });
    }

    await Attendance.insertMany(attendanceRecords);
    console.log(`✅ ${attendanceRecords.length} attendance records created for March 2026`);

    // ── 5. Print summary ──
    const present = attendanceRecords.filter(a => a.status === "Present").length;
    const absent = attendanceRecords.filter(a => a.status === "Absent").length;
    const overtime = attendanceRecords.filter(a => a.status === "Overtime").length;
    const late = attendanceRecords.filter(a => a.isLate).length;
    const halfDay = attendanceRecords.filter(a => a.status === "Half Day").length;

    console.log("\n📊 Attendance Summary for March 2026:");
    console.log(`   Present  : ${present} days`);
    console.log(`   Absent   : ${absent} days`);
    console.log(`   Overtime : ${overtime} days`);
    console.log(`   Late     : ${late} days`);
    console.log(`   Half Day : ${halfDay} days`);
    console.log("\n👤 Login credentials:");
    console.log("   Email    : dummy.employee@test.com");
    console.log("   Password : Test@1234");
    console.log("   Salary   : ₹50,000/month");
    console.log("\n🎉 Seed complete! Now test your payroll with this employee.");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error.message);
    process.exit(1);
  }
};

seed();