import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";       // ✅ ADD THIS
import Signup from "./pages/auth/Signup";
import Login from "./pages/auth/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";


/* ================= AUTH GUARD ================= */
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  // ❌ Not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Logged in
  return children;
};

/* ================= APP ================= */
const App = () => {
  return (
    <>
   

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />          {/* ✅ HOME */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} /> {/* ✅ redirect to home */}
      </Routes>
    </>
  );
};

export default App;
