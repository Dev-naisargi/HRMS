import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";
import api from "../../utils/api";

const Signup = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    companyName: "",
    companyAddress: "",
    companyPhone: "",
    adminName: "",
    adminEmail: "",
    password: "",
    confirmPassword: "",
  });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const nameRegex = /^[A-Za-z\s]+$/;
  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/;

  const validateField = (name, value, data = formData) => {
    let message = "";

    if (!value.trim()) {
      message = "This field is required";
    }

    if (name === "companyName" && value && !nameRegex.test(value)) {
      message = "Only alphabets allowed";
    }

    if (name === "adminName" && value && !nameRegex.test(value)) {
      message = "Only alphabets allowed";
    }

    // ✅ STRICT PHONE VALIDATION
    if (name === "companyPhone") {
      if (!value.trim()) {
        message = "Phone number is required";
      } else if (!/^\d{10}$/.test(value)) {
        message = "Phone number must be exactly 10 digits";
      }
    }

    if (name === "adminEmail" && value && !emailRegex.test(value)) {
      message = "Enter valid email address";
    }

    if (name === "password" && value && !passwordRegex.test(value)) {
      message =
        "Password must be strong (8+ chars, number, symbol)";
    }

    if (name === "confirmPassword" && value !== data.password) {
      message = "Passwords do not match";
    }

    setErrors((prev) => ({ ...prev, [name]: message }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    let newValue = value;

    if (name === "adminName" || name === "companyName") {
      newValue = value.replace(/[^A-Za-z\s]/g, "");
    }

    // ✅ STRICT PHONE INPUT CONTROL
    if (name === "companyPhone") {
      newValue = value.replace(/\D/g, "");
      if (newValue.length > 10) return;
    }

    const updated = { ...formData, [name]: newValue };
    setFormData(updated);
    validateField(name, newValue, updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let newErrors = {};

    Object.keys(formData).forEach((key) => {
      if (!formData[key].trim()) {
        newErrors[key] = "This field is required";
      }
    });

    if (!nameRegex.test(formData.adminName)) {
      newErrors.adminName = "Only alphabets allowed";
    }

    if (!/^\d{10}$/.test(formData.companyPhone)) {
      newErrors.companyPhone =
        "Phone number must be exactly 10 digits";
    }

    if (!emailRegex.test(formData.adminEmail)) {
      newErrors.adminEmail = "Invalid email";
    }

    if (!passwordRegex.test(formData.password)) {
      newErrors.password = "Weak password";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fix the errors");
      return;
    }

    const loadingToast = toast.loading("Creating your account...");
    setLoading(true);

    try {
      await api.post("/auth/register", formData);
      toast.success("Account created successfully");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
    } finally {
      toast.dismiss(loadingToast);
      setLoading(false);
    }
  };

  const inputStyle = (field) => `
    w-full px-4 py-2.5 rounded-lg border outline-none transition text-sm
    bg-white dark:bg-gray-800
    text-gray-900 dark:text-gray-100
    ${
      errors[field]
        ? "border-red-500 focus:ring-2 focus:ring-red-500/30"
        : "border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
    }
  `;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center py-10 px-4 transition-colors duration-500">
      <Toaster position="top-center" />

      <div className="w-full max-w-[440px]">

        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-emerald-600 p-2 rounded-lg">
              <ShieldCheckIcon className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              HR<span className="text-emerald-600">MS</span>
            </span>
          </Link>
          <h2 className="text-2xl font-bold mt-4 text-gray-900 dark:text-gray-100">
            Create Company Account
          </h2>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-8 rounded-2xl shadow-sm transition-colors">

          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Company Details
              </h3>

              <div>
                <label className="text-sm">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="companyName"
                  placeholder="Company Name"
                  onChange={handleChange}
                  className={inputStyle("companyName")}
                />
                {errors.companyName && (
                  <p className="text-xs text-red-500">{errors.companyName}</p>
                )}
              </div>

              <div>
                <label className="text-sm">
                  Company Address <span className="text-red-500">*</span>
                </label>
                <input
                  name="companyAddress"
                  placeholder="Company Address"
                  onChange={handleChange}
                  className={inputStyle("companyAddress")}
                />
                {errors.companyAddress && (
                  <p className="text-xs text-red-500">{errors.companyAddress}</p>
                )}
              </div>

              <div>
                <label className="text-sm">
                  Company Phone <span className="text-red-500">*</span>
                </label>
               <input
  name="companyPhone"
  placeholder="Enter 10-digit phone number"
  value={formData.companyPhone}
  onChange={(e) => {
    let value = e.target.value;

    // remove non-digits
    value = value.replace(/\D/g, "");

    // STRICT: limit to 10 digits (no overflow even for 1ms)
    value = value.slice(0, 10);

    const updated = { ...formData, companyPhone: value };
    setFormData(updated);
    validateField("companyPhone", value, updated);
  }}
  onKeyDown={(e) => {
    // prevent typing if already 10 digits (except backspace/delete)
    if (
      formData.companyPhone.length >= 10 &&
      e.key !== "Backspace" &&
      e.key !== "Delete" &&
      !e.ctrlKey
    ) {
      e.preventDefault();
    }
  }}
  className={inputStyle("companyPhone")}
/>
                {errors.companyPhone && (
                  <p className="text-xs text-red-500">{errors.companyPhone}</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Admin Details
              </h3>

              <div>
                <label className="text-sm">
                  Admin Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="adminName"
                  placeholder="Admin Name"
                  onChange={handleChange}
                  className={inputStyle("adminName")}
                />
                {errors.adminName && (
                  <p className="text-xs text-red-500">{errors.adminName}</p>
                )}
              </div>

              <div>
                <label className="text-sm">
                  Work Email <span className="text-red-500">*</span>
                </label>
                <input
                  name="adminEmail"
                  placeholder="Work Email"
                  onChange={handleChange}
                  className={inputStyle("adminEmail")}
                />
                {errors.adminEmail && (
                  <p className="text-xs text-red-500">{errors.adminEmail}</p>
                )}
              </div>

              <div>
                <label className="text-sm">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    onChange={handleChange}
                    className={inputStyle("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3 text-gray-400"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="text-sm">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    onChange={handleChange}
                    className={inputStyle("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-4 top-3 text-gray-400"
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-400 text-white rounded-lg font-medium flex justify-center gap-2 transition"
            >
              {loading ? "Processing..." : (
                <>
                  Register Company <ArrowRightIcon className="h-4 w-4" />
                </>
              )}
            </button>

            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-emerald-600 hover:underline font-semibold"
              >
                Sign In
              </Link>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;