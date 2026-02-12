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

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Email and Password are required");
      return;
    }

    if (!email.includes("@")) {
      toast.error("Enter a valid email");
      return;
    }

    const loadingToast = toast.loading("Logging in...");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      toast.success("Login successful", { id: loadingToast });

      setTimeout(() => navigate("/admin/dashboard"), 1500);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Invalid email or password",
        { id: loadingToast }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Toaster position="top-center" />

      <div className="w-full max-w-[420px]">
        <div className="flex flex-col items-center mb-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-emerald-600 p-2 rounded-lg">
              <ShieldCheckIcon className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-semibold">
              HR<span className="text-emerald-600">MS</span>
            </span>
          </Link>
          <h2 className="text-2xl font-bold mt-4">Welcome Back</h2>
        </div>

        <div className="bg-white p-8 rounded-3xl border">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="admin@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div className="relative">
              <label className="block text-sm text-gray-600 mb-1">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[38px] text-gray-400"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
              </button>
            </div>

            <button
              disabled={loading}
              className="w-full py-3 bg-emerald-600 text-white rounded-xl font-medium flex justify-center gap-2"
            >
              {loading ? "Please wait..." : <>Sign In <ArrowRightIcon className="h-4 w-4" /></>}
            </button>

            <div className="text-center text-sm mt-4">
              Don&apos;t have an account?
              <Link to="/signup" className="text-emerald-600 ml-1">
                Register
              </Link>
            </div>

            <div className="text-center">
              <Link
                to="/forgot-password"
                className="text-xs text-gray-400"
              >
                Forgot Password?
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
