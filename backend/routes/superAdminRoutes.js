const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const {
  getAllCompanies,
  approveCompany,
  rejectCompany,
  getSystemStats,
  getAllHRs,
  getAllEmployees
} = require("../controllers/superAdminController");

// You can later add role middleware
router.get("/companies", protect, getAllCompanies);
router.get("/stats", protect, getSystemStats);
router.get("/hrs", protect, getAllHRs);
router.get("/employees", protect, getAllEmployees);

router.put("/approve/:id", protect, approveCompany);
router.put("/reject/:id", protect, rejectCompany);

module.exports = router;