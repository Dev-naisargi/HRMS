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
  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

  const validateField = (name, value, data = formData) => {
    let message = "";

    if (name === "companyPhone" && value && !/^\d{10}$/.test(value)) {
      message = "Phone number must be 10 digits";
    }

    if (name === "adminEmail" && value && !emailRegex.test(value)) {
      message = "Invalid email format";
    }

    if (name === "password" && value && !passwordRegex.test(value)) {
      message =
        "Password must include letters, numbers & special characters";
    }

    if (
      name === "confirmPassword" &&
      value &&
      value !== data.password
    ) {
      message = "Passwords do not match";
    }

    setErrors((prev) => ({
      ...prev,
      [name]: message,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData);

    validateField(name, value, updatedData);
  };

  const validateForm = () => {
    let valid = true;

    Object.keys(formData).forEach((key) => {
      validateField(key, formData[key]);
      if (errors[key]) valid = false;
    });

    if (!valid) {
      toast.error("Please fix validation errors");
    }

    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const loadingToast = toast.loading("Creating your account...");
    setLoading(true);

    try {
      await api.post("/company/register", formData);
      toast.success("Company registered successfully!", {
        id: loadingToast,
      });
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      const msg =
        error.response?.data?.message || "Registration Failed";
      toast.error(msg, { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  const sectionHeaderStyle =
    "text-[13px] font-bold text-emerald-700 mb-3 border-b border-emerald-50 pb-1";
  const labelStyle =
    "block text-[12px] font-medium text-gray-600 mb-1.5 ml-0.5";

  const inputStyle = (field) => `
    w-full px-4 py-2.5 bg-white border rounded-xl outline-none transition-all text-[14px]
    ${
      errors[field]
        ? "border-red-400 focus:ring-1 focus:ring-red-300"
        : "border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
    }
  `;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-10 px-4">
      <Toaster position="top-center" />

      <div className="w-full max-w-[440px]">
        <div className="flex flex-col items-center mb-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-emerald-600 p-2 rounded-lg">
              <ShieldCheckIcon className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-semibold">
              HR<span className="text-emerald-600">MS</span>
            </span>
          </Link>
          <h2 className="text-2xl font-bold mt-4">
            Create Company Account
          </h2>
        </div>

        <div className="bg-white rounded-3xl p-8 border">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <h3 className={sectionHeaderStyle}>Company Details</h3>

              <input
                name="companyName"
                placeholder="Company Name"
                required
                onChange={handleChange}
                className={inputStyle("companyName")}
              />

              <input
                name="companyAddress"
                placeholder="Company Address"
                required
                onChange={handleChange}
                className={inputStyle("companyAddress")}
              />

              <div>
                <input
                  name="companyPhone"
                  placeholder="Company Phone"
                  required
                  onChange={handleChange}
                  className={inputStyle("companyPhone")}
                />
                {errors.companyPhone && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.companyPhone}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className={sectionHeaderStyle}>Admin Details</h3>

              <input
                name="adminName"
                placeholder="Admin Name"
                required
                onChange={handleChange}
                className={inputStyle("adminName")}
              />

              <div>
                <input
                  name="adminEmail"
                  placeholder="Work Email"
                  required
                  onChange={handleChange}
                  className={inputStyle("adminEmail")}
                />
                {errors.adminEmail && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.adminEmail}
                  </p>
                )}
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  required
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
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  required
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
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full py-3 bg-emerald-600 text-white rounded-xl font-medium flex justify-center gap-2"
            >
              {loading ? "Processing..." : <>Register Company <ArrowRightIcon className="h-4 w-4" /></>}
              
            </button>
            <p className="mt-6 text-center text-sm text-gray-500">
  Already have an account?{" "}
  <Link
    to="/login"
    className="text-emerald-600 font-semibold hover:underline"
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
