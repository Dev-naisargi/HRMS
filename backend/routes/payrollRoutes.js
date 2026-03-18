const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { getPayrolls, updatePayroll } = require("../controllers/payrollController");

router.get("/", protect, getPayrolls);
router.put("/:id", protect, updatePayroll);

module.exports = router;