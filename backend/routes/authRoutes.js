const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  registerAdmin,
  loginAdmin,
  googleLoginAdminSimple,
  logout,
  getMe,
  updateProfile,
} = require("../controllers/authController");

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.post("/google-login-simple", googleLoginAdminSimple);
router.post("/logout", logout);
router.get("/me", protect, getMe);
router.put("/update-profile", protect, updateProfile);

module.exports = router;