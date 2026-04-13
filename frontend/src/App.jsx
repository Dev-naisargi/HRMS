import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Home from "./pages/Home";
import Signup from "./pages/auth/Signup";
import Login from "./pages/auth/Login";

// New Unified Layouts
import DashboardLayout from "./layouts/DashboardLayout";
import SuperAdminLayout from "./layouts/SuperAdminLayout";

// Unified Dashboard Pages (role-adaptive)
import Overview from "./pages/dashboard/Overview";
import Employees from "./pages/dashboard/Employees";
import Attendance from "./pages/dashboard/Attendance";
import Payroll from "./pages/dashboard/Payroll";
import LeaveManagement from "./pages/dashboard/LeaveManagement";
import Reports from "./pages/dashboard/Reports";
import Settings from "./pages/dashboard/Settings";
import ProfilePage from "./pages/profile/ProfilePage";

// HR Management (Admin only)
import HRmanagement from "./pages/admin/HRmanagement";
// Super Admin Pages
import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard";
import CompanyManagement from "./pages/superadmin/CompanyManagement";
import SystemReports from "./pages/superadmin/SystemReports";

/* ================= AUTH CHECK ================= */
const isAuthenticated = () => !!localStorage.getItem("token");
const getRole = () => {
  const role = localStorage.getItem("role");
  return role ? role.toUpperCase() : null;
};

// All roles now land on /dashboard
const getRedirectPath = () => "/dashboard";

/* ================= PROTECTED ROUTE ================= */
const ProtectedRoute = ({ children, allowedRoles }) => {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(getRole())) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

/* ================= PUBLIC ROUTE ================= */
const PublicRoute = ({ children }) => {
  if (isAuthenticated()) return <Navigate to={getRedirectPath()} replace />;
  return children;
};

/* ================= APP ================= */
const App = () => {

  // Load saved theme on first render
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Routes>

        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

        {/* ── Unified Company Dashboard ── */}
        <Route
          path="/dashboard"
          element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}
        >
          <Route index element={<Overview />} />
          {/* Admin: HR Management — create/edit/delete HR officers */}
          <Route path="hr" element={
            <ProtectedRoute allowedRoles={["ADMIN"]}><HRmanagement /></ProtectedRoute>
          } />
          {/* HR role: Employee Management */}
          <Route path="employees" element={
            <ProtectedRoute allowedRoles={["HR"]}><Employees /></ProtectedRoute>
          } />
          <Route path="attendance" element={<Attendance />} />
          <Route path="leave" element={
            <ProtectedRoute allowedRoles={["HR", "ADMIN", "EMPLOYEE"]}><LeaveManagement /></ProtectedRoute>
          } />
          <Route path="payroll" element={<Payroll />} />
          <Route path="reports" element={
            <ProtectedRoute allowedRoles={["ADMIN"]}><Reports /></ProtectedRoute>
          } />
          <Route path="settings" element={
            <ProtectedRoute allowedRoles={["ADMIN"]}><Settings /></ProtectedRoute>
          } />
        </Route>

        {/* Profile — accessible to all authenticated users */}
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

        {/* ── Super Admin Panel (self-contained, manages own tabs) ── */}
        <Route path="/superadmin/*" element={
          <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
            <SuperAdminLayout />
          </ProtectedRoute>
        } />

        {/* Legacy redirects so old saved links still work */}
        <Route path="/admin/dashboard" element={<Navigate to="/dashboard" replace />} />
        <Route path="/hr/dashboard" element={<Navigate to="/dashboard" replace />} />
        <Route path="/employee/dashboard" element={<Navigate to="/dashboard" replace />} />

        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
      <Toaster position="top-right" />
    </div>
  );
};

export default App;