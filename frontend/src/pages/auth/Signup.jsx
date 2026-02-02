import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/solid";

const Signup = () => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "HR", // 🔒 fixed role
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/hr/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.fullName,
          email: form.email,
          password: form.password,
          // ⚠️ role is NOT trusted by backend
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Signup failed");
        return;
      }

      alert("Account created successfully. Please login.");
      navigate("/login");
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-16 px-4">
      {/* Heading */}
      <div className="text-center m-4">
        <h1 className="text-2xl font-semibold mb-2">
          Create HR Account
        </h1>
        <p className="text-gray-600">
          Sign up to access the HRMS dashboard
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-8 rounded-lg shadow-md"
      >
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

        {/* Role (locked) */}
        <label className="block text-sm font-medium mb-1">Role</label>
        <input
          type="text"
          value="HR"
          disabled
          className="w-full p-2 mb-6 border border-gray-300 rounded bg-gray-100 text-gray-600"
        />

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded
                     font-medium hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Create Account"}
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
