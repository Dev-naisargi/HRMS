const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");
const {
  createHR,
  getHRs,
  updateHR,
  deleteHR,
  getStats,
  getChartData, 
} = require("../controllers/adminController");

router.get("/stats", protect, adminOnly, getStats);
router.post("/create-hr", protect, adminOnly, createHR);
router.get("/hrs", protect, adminOnly, getHRs);
router.put("/hrs/:id", protect, adminOnly, updateHR);
router.delete("/hrs/:id", protect, adminOnly, deleteHR);
router.get("/charts", protect, adminOnly, getChartData);
module.exports = router;