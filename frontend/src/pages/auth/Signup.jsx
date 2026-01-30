import { useState } from "react";
import { Link } from "react-router-dom";
import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  ChevronDownIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/solid";

const Signup = () => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(form);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-16 px-4">
      {/* Heading */}
      <div className="text-center m-4">
        <h1 className="text-2xl font-semibold mb-2">
          Create Admin / HR Account
        </h1>
        <p className="text-gray-600">
          Sign up to access the HRMS dashboard
        </p>
      </div>

      {/* Form */}
      <form className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        {/* Full Name */}
        <label className="block text-sm font-medium mb-1">Full Name</label>
        <div className="relative mb-4">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <UserIcon className="w-5 h-5 text-gray-500" />
          </div>
          <input
            type="text"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            placeholder="Enter your full name"
            className="w-full pl-12 p-2 border border-gray-500 rounded
                       focus:ring-2 focus:ring-blue-600 focus:outline-none"
            required
          />
        </div>

        {/* Email */}
        <label className="block text-sm font-medium mb-1">Email Address</label>
        <div className="relative mb-4">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <EnvelopeIcon className="w-5 h-5 text-gray-500" />
          </div>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter your email"
            className="w-full pl-12 p-2 border border-gray-500 rounded
                       focus:ring-2 focus:ring-blue-600 focus:outline-none"
            required
          />
        </div>

        {/* Password */}
        <label className="block text-sm font-medium mb-1">Password</label>
        <div className="relative mb-4">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
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
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Create a password"
            className="w-full pl-12 pr-12 p-2 border border-gray-500 rounded
                       focus:ring-2 focus:ring-blue-600 focus:outline-none"
            required
          />
        </div>

        {/* Confirm Password */}
        <label className="block text-sm font-medium mb-1">
          Confirm Password
        </label>
        <div className="relative mb-6">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <LockClosedIcon className="w-5 h-5 text-gray-500" />
          </div>

          <div
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
            onClick={() =>
              setShowConfirmPassword(!showConfirmPassword)
            }
          >
            {showConfirmPassword ? (
              <EyeSlashIcon className="w-5 h-5 text-gray-500" />
            ) : (
              <EyeIcon className="w-5 h-5 text-gray-500" />
            )}
          </div>

          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter your password"
            className="w-full pl-12 pr-12 p-2 border border-gray-500 rounded
                       focus:ring-2 focus:ring-blue-600 focus:outline-none"
            required
          />
        </div>

        {/* Role */}
        <label className="block text-sm font-medium mb-1">Role</label>
        <div className="relative mb-6">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <ChevronDownIcon className="w-5 h-5 text-gray-500" />
          </div>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full pl-12 p-2 border border-gray-500 rounded
                       focus:ring-2 focus:ring-blue-600 focus:outline-none"
            required
          >
            <option value="">Select role</option>
            <option value="admin">Admin</option>
            <option value="hr">HR</option>
          </select>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded
                     font-medium hover:bg-blue-700"
        >
          Create Account
        </button>

        {/* Login link */}
        <p className="text-center text-sm mt-4">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 font-semibold hover:underline"
          >
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;
