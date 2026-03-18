import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Signup from "./pages/auth/Signup";
import Login from "./pages/auth/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import HRDashboard from "./pages/hr/HRDashboard";
import ProfilePage from "./pages/profile/ProfilePage";
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard";


/* ================= AUTH CHECK ================= */
const isAuthenticated = () => !!localStorage.getItem("token");
const getRole = () => {
  const role = localStorage.getItem("role");
  return role ? role.toUpperCase() : null;
};

const getRedirectPath = () => {
  const role = getRole();
  if (role === "HR") return "/hr/dashboard";
  if (role === "EMPLOYEE") return "/employee/dashboard";
  return "/admin/dashboard";
};

/* ================= PROTECTED ROUTE ================= */
const ProtectedRoute = ({ children, allowedRole }) => {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  if (allowedRole && getRole() !== allowedRole) {
    return <Navigate to={getRedirectPath()} replace />;
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

  // 🔥 Load saved theme on first render
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/superadmin" element={<SuperAdminDashboard />} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRole="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/hr/dashboard"
          element={
            <ProtectedRoute allowedRole="HR">
              <HRDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employee/dashboard"
          element={
            <ProtectedRoute allowedRole="EMPLOYEE">
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </div>
  );
};

export default App;