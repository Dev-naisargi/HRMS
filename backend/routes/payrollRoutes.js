const express = require("express");
const router  = express.Router();
const {
    generatePayroll,
    getPayrollPreview,
    getPayrolls,
    submitPayroll,
    approvePayroll,
    rejectPayroll,
    payPayroll,
    getPayslip,
} = require("../controllers/payrollController");
const { protect }    = require("../middleware/authMiddleware");
const { authorize }  = require("../middleware/roleMiddleware");

// ── Shared (HR + Admin + Employee) ──
router.get("/",              protect, getPayrolls);
router.get("/preview",       protect, authorize("HR", "ADMIN"), getPayrollPreview);
router.get("/:id/payslip",   protect, getPayslip);

// ── HR only ──
router.post("/generate",     protect, authorize("HR", "ADMIN"), generatePayroll);
router.put("/:id/submit",    protect, authorize("HR"), submitPayroll);

// ── Admin only ──
router.put("/:id/approve",   protect, authorize("ADMIN"), approvePayroll);
router.put("/:id/reject",    protect, authorize("ADMIN"), rejectPayroll);
router.put("/:id/pay",       protect, authorize("ADMIN"), payPayroll);

module.exports = router;