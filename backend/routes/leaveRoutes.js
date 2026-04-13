const express = require("express");
const router = express.Router();
const { applyLeave, getLeaves, approveLeaveHR, approveLeaveAdmin,deleteLeave } = require("../controllers/leaveController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.post("/apply", protect, authorize("EMPLOYEE"), applyLeave);
router.get("/", protect, authorize("EMPLOYEE", "HR", "ADMIN"), getLeaves);
router.delete("/:id", protect, authorize("EMPLOYEE"), deleteLeave);
router.patch("/approve/hr/:id", protect, authorize("HR"), approveLeaveHR);
router.patch("/approve/admin/:id", protect, authorize("ADMIN"), approveLeaveAdmin);

module.exports = router;
