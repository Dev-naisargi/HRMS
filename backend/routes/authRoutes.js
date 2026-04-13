const express = require("express");
const router = express.Router();
const { registerCompany, login, getMe, updateProfile, changePassword } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register-company", registerCompany);
router.post("/login", login);
router.get("/me", protect, getMe);
router.put("/update-profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);

module.exports = router;
