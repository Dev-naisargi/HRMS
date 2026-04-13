const express = require("express");
const router = express.Router();
const {
  checkIn,
  breakStart,
  breakEnd,
  checkOut,
  getMyAttendance,
  getAllAttendance,
} = require("../controllers/attendanceController");
const { protect } = require("../middleware/authMiddleware");

// 4 Stamp Routes (Employee only)
router.post("/checkin", protect, checkIn);
router.put("/break/start", protect, breakStart);
router.put("/break/end", protect, breakEnd);
router.put("/checkout", protect, checkOut);

// View Routes
router.get("/my", protect, getMyAttendance);
router.get("/all", protect, getAllAttendance);

module.exports = router;