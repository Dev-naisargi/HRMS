const express = require("express");
const router = express.Router();
const { addEmployee, getEmployees, updateEmployee, deleteEmployee } = require("../controllers/employeeController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.post("/", protect, authorize("ADMIN", "HR"), addEmployee);
router.get("/", protect, authorize("ADMIN", "HR"), getEmployees);
router.put("/:id", protect, authorize("ADMIN", "HR"), updateEmployee);
router.delete("/:id", protect, authorize("ADMIN", "HR"), deleteEmployee);

module.exports = router;
