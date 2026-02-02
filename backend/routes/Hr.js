const express = require("express");
const { signupHR, loginHR } = require("../controllers/Hr");

const router = express.Router();

router.post("/signup", signupHR);
router.post("/login", loginHR);

module.exports = router;
