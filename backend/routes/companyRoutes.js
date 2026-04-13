const express = require("express");
const router = express.Router();
const { registerCompany, getCompanies, updateCompanyStatus, deleteCompany } = require("../controllers/companyController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");


router.post(
  "/register",
  protect,
  authorize("SUPER_ADMIN"),
  registerCompany
);
router.get("/", protect, authorize("SUPER_ADMIN"), getCompanies);
router.patch("/:id/status", protect, authorize("SUPER_ADMIN"), updateCompanyStatus);
router.delete("/:id", protect, authorize("SUPER_ADMIN"), deleteCompany);

module.exports = router;
