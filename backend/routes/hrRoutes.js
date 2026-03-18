const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { getHRDashboard } = require("../controllers/hrController");

// HR Dashboard
router.get("/dashboard", protect, (req, res, next) => {
  if (req.user.role !== "HR") {
    return res.status(403).json({ message: "HR access only" });
  }
  next();
}, getHRDashboard);

module.exports = router;