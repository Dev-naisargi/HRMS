import React, { useState } from "react";
import {
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  UserIcon,
} from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/hr/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Login failed");
        setLoading(false);
        return;
      }

      // ✅ Save JWT token
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);

      // ✅ Redirect to HR dashboard
      navigate("/hr/dashboard");
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-16 px-4">
      {/* Heading */}
      <div className="text-center m-4">
        <h1 className="text-2xl font-semibold mb-2">Welcome Back</h1>
        <p className="text-gray-600">
          Login to access your HRMS dashboard
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-8 rounded-lg shadow-md"
      >
        {/* Email */}
        <label className="block text-sm font-medium mb-1">
          Email Address
        </label>
        <div className="relative mb-4">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 bg-white p-1 rounded">
            <EnvelopeIcon className="w-5 h-5 text-gray-500" />
          </div>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-12 p-2 border border-gray-500 rounded
                       focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            required
          />
        </div>

        {/* Password */}
        <label className="block text-sm font-medium mb-1">
          Password
        </label>
        <div className="relative mb-6">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 bg-white p-1 rounded">
            <LockClosedIcon className="w-5 h-5 text-gray-500" />
          </div>

          <div
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeSlashIcon className="w-5 h-5 text-gray-500" />
            ) : (
              <EyeIcon className="w-5 h-5 text-gray-500" />
            )}
          </div>

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-12 pr-12 p-2 border border-gray-500 rounded
                       focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            required
          />
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded font-medium
                     flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-60"
        >
          <UserIcon className="w-5 h-5" />
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;
