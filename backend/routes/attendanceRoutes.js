const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");
const protect = require("../middleware/authMiddleware");

router.post("/checkin", protect, attendanceController.checkIn);
router.put("/checkout", protect, attendanceController.checkOut);
router.get("/my", protect, attendanceController.getMyAttendance);
router.get("/all", protect, attendanceController.getAllAttendance);

module.exports = router;