import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate, Link } from "react-router-dom";
import {
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";
import api from "../../utils/api";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const redirectByRole = (role) => {
  if (role === "SUPER_ADMIN") navigate("/superadmin");
  else if (role === "HR") navigate("/hr/dashboard");
  else if (role === "EMPLOYEE") navigate("/employee/dashboard");
  else navigate("/admin/dashboard");
};

  // ✅ VALIDATE
  const validate = () => {
    let newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Enter valid email address";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Please fix the errors");
      return;
    }

    const loadingToast = toast.loading("Logging in...");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      toast.success("Login successful", { id: loadingToast });
      setTimeout(() => redirectByRole(res.data.role), 1200);

    } catch (err) {
      toast.error(
        err.response?.data?.message || "Invalid email or password",
        { id: loadingToast }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const loadingToast = toast.loading("Logging in with Google...");
    setLoading(true);

    try {
      const res = await api.post("/auth/google-login-simple", {
        credential: credentialResponse.credential,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      toast.success("Google login successful", { id: loadingToast });
      redirectByRole(res.data.role);

    } catch (err) {
      toast.error(
        err.response?.data?.message || "Google login failed",
        { id: loadingToast }
      );
    } finally {
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4 transition-colors duration-500">
      <Toaster position="top-center" />

      <div className="w-full max-w-[420px]">

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
            Welcome Back
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Sign in to your account
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-8 rounded-2xl shadow-sm transition-colors">

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-sm mb-1 text-gray-600 dark:text-gray-400">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="admin@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors({ ...errors, email: "" });
                }}
                className={inputStyle("email")}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="relative">
              <label className="block text-sm mb-1 text-gray-600 dark:text-gray-400">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors({ ...errors, password: "" });
                }}
                className={inputStyle("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[38px] text-gray-400 dark:text-gray-500"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
              </button>
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Button */}
            <button
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-400 text-white rounded-lg font-medium flex justify-center gap-2 transition"
            >
              {loading ? "Please wait..." : (
                <>
                  Sign In <ArrowRightIcon className="h-4 w-4 mt-0.5" />
                </>
              )}
            </button>

            <div className="flex items-center my-2">
              <hr className="flex-grow border-gray-200 dark:border-gray-700" />
              <span className="px-3 text-gray-400 text-sm">OR</span>
              <hr className="flex-grow border-gray-200 dark:border-gray-700" />
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error("Google Login Failed")}
                width="240"
              />
            </div>

            <div className="text-center text-sm mt-3 text-gray-600 dark:text-gray-400">
              Don&apos;t have an account?{" "}
              <Link
                to="/signup"
                className="text-emerald-600 hover:underline font-semibold"
              >
                Register
              </Link>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;