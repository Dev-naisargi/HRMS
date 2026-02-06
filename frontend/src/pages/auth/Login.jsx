import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { EnvelopeIcon, LockClosedIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import api from "../../utils/api";

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/login", formData);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      const role = res.data.role;
      if (role === "ADMIN") navigate("/admin/dashboard");
      else if (role === "HR") navigate("/hr/dashboard");
      else navigate("/employee/dashboard");
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-green-50/30 flex flex-col justify-center py-12 px-6 font-sans text-sm">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <Link to="/" className="inline-flex items-center gap-2 group mb-4">
          <div className="bg-emerald-600 p-1.5 rounded-lg transition-transform group-hover:rotate-3 shadow-md shadow-emerald-100">
            <ShieldCheckIcon className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tighter text-gray-900">
            HR<span className="text-emerald-600">MS</span>
          </span>
        </Link>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Welcome Back</h2>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-[400px]">
        <div className="bg-white py-10 px-8 shadow-xl shadow-emerald-900/5 border border-green-100 rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <EnvelopeIcon className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
                <input type="email" name="email" required onChange={handleChange} className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <LockClosedIcon className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
                <input type="password" name="password" required onChange={handleChange} className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
              </div>
            </div>
            <button disabled={loading} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 active:scale-95">
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>
          <div className="mt-8 text-center border-t border-green-50 pt-6">
            <p className="text-gray-500 font-medium">New here? <Link to="/signup" className="text-emerald-600 font-bold hover:underline">Create a company</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;