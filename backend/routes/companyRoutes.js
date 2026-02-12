// routes/companyRoutes.js
const express = require("express");
const { registerCompany } = require("../controllers/companyController");

const router = express.Router();

router.post("/register", registerCompany);

module.exports = router;
