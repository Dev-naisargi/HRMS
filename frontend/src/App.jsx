import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";       // ✅ ADD THIS
import Signup from "./pages/auth/Signup";
import Login from "./pages/auth/Login";

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
          path="/hr/dashboard"
          element={
            <ProtectedRoute>
              <h1 className="text-2xl font-bold p-6">HR Dashboard</h1>
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
