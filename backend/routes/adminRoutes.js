const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const {
  createHR,
  getHRs,
  updateHR,
  deleteHR,
  getStats,
  getChartData, 
} = require("../controllers/adminController");

router.get("/stats", protect, authorize("ADMIN","HR"), getStats);
router.post("/create-hr", protect, authorize("ADMIN"), createHR);
router.get("/hrs", protect, authorize("ADMIN"), getHRs);
router.put("/hrs/:id", protect, authorize("ADMIN"), updateHR);
router.delete("/hrs/:id", protect, authorize("ADMIN"), deleteHR);
router.get("/charts", protect, authorize("ADMIN","HR"), getChartData);

module.exports = router;
