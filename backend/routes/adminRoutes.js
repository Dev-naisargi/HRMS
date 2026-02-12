// routes/adminRoutes.js
const express = require("express");
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

router.get("/dashboard", protect, adminOnly, (req, res) => {
  res.json({
    message: "Welcome Admin",
    adminId: req.user.userId,
    companyId: req.user.companyId,
  });
});

module.exports = router;
