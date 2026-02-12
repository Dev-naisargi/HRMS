// routes/authRoutes.js
const express = require("express");
const { loginAdmin, logout } = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/login", loginAdmin);
router.post("/logout", protect, logout);

module.exports = router;
