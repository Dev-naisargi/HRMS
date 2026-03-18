const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  applyLeave,
  getMyLeaves,
  getCompanyLeaves,
  updateLeaveStatus,
  cancelLeave
} = require("../controllers/leaveController");

router.post("/apply", protect, applyLeave);

router.get("/my", protect, getMyLeaves);

router.get("/company", protect, getCompanyLeaves);

router.put("/status/:id", protect, updateLeaveStatus);

/*  THIS ROUTE IS REQUIRED FOR DELETE */

router.delete("/:id", protect, cancelLeave);

module.exports = router;