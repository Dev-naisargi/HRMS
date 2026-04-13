const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const { getHRDashboard } = require("../controllers/hrController");

router.get("/dashboard", protect, authorize("HR"), getHRDashboard);

module.exports = router;
