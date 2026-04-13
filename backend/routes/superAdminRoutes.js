const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const {
  getAllCompanies,
  getCompanyDetails,
  approveCompany,
  rejectCompany,
  updateCompany,
  deleteCompany,
  updateCompanyStatus,
  manageSubscription,
  getSystemStats,
  getAllHRs,
  getAllEmployees,
  getReports,
  generateReport,
  deleteReport
} = require("../controllers/superAdminController");

// --- Company Management (v2) ---
router.get("/companies", protect, authorize("SUPER_ADMIN"), getAllCompanies);
router.get("/company/:id", protect, authorize("SUPER_ADMIN"), getCompanyDetails);
router.patch("/company/:id/approve", protect, authorize("SUPER_ADMIN"), approveCompany);
router.patch("/company/:id/reject", protect, authorize("SUPER_ADMIN"), rejectCompany);
router.put("/company/:id", protect, authorize("SUPER_ADMIN"), updateCompany);
router.delete("/company/:id", protect, authorize("SUPER_ADMIN"), deleteCompany);
router.patch("/company/:id/status", protect, authorize("SUPER_ADMIN"), updateCompanyStatus);
router.patch("/company/:id/subscription", protect, authorize("SUPER_ADMIN"), manageSubscription);

// --- Stats & Others ---
router.get("/stats", protect, authorize("SUPER_ADMIN"), getSystemStats);
router.get("/hrs", protect, authorize("SUPER_ADMIN"), getAllHRs);
router.get("/employees", protect, authorize("SUPER_ADMIN"), getAllEmployees);
router.get("/reports", protect, authorize("SUPER_ADMIN"), getReports);
router.post("/reports", protect, authorize("SUPER_ADMIN"), generateReport);
router.delete("/reports/:id", protect, authorize("SUPER_ADMIN"), deleteReport);

module.exports = router;
