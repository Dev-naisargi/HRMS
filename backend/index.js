const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

// ── Middleware ──
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Database ──
connectDB();

// ── Routes ──
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/company", require("./routes/companyRoutes"));
app.use("/api/superadmin", require("./routes/superAdminRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/hr", require("./routes/hrRoutes"));
app.use("/api/employees", require("./routes/employeeRoutes"));
app.use("/api/leave", require("./routes/leaveRoutes"));
app.use("/api/attendance", require("./routes/attendanceRoutes"));
app.use("/api/payroll", require("./routes/payrollRoutes"));


// ── Start Server ──
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});