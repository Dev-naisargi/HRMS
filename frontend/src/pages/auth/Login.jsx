import React, { useState } from "react";
import {
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  UserIcon,
} from "@heroicons/react/24/solid";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login clicked");
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
          {/* Lock icon */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 bg-white p-1 rounded">
            <LockClosedIcon className="w-5 h-5 text-gray-500" />
          </div>

          {/* Eye icon */}
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
          className="w-full bg-blue-600 text-white py-2 rounded font-medium
                     flex items-center justify-center gap-2 hover:bg-blue-700"
        >
          <UserIcon className="w-5 h-5" />
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
