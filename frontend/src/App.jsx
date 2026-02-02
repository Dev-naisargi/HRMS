import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
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
      <Navbar />

      <Routes>
        {/* Public Routes */}
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

        {/* Default Route */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </>
  );
};

export default App;
