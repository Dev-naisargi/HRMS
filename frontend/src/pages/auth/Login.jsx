import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShieldCheckIcon, EyeIcon, EyeSlashIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";
import api from "../../utils/api";

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading("Verifying credentials...");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", formData);
      toast.success("Login successful!", { id: loadingToast });
      
      // Store token if applicable
      localStorage.setItem("token", response.data.token);
      
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (error) {
      const msg = error.response?.data?.message || "Invalid Email or Password";
      toast.error(msg, { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  const sectionHeaderStyle = "text-[13px] font-bold text-emerald-700 mb-3 border-b border-emerald-50 pb-1";
  const labelStyle = "block text-[12px] font-medium text-gray-600 mb-1.5 ml-0.5";
  const inputStyle = "w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none transition-all text-[14px] text-gray-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-10 px-4 font-sans antialiased">
      <Toaster position="top-center" reverseOrder={false} />

      <div className="w-full max-w-[440px]">
        {/* Branding */}
        <div className="flex flex-col items-center mb-6">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-emerald-600 p-2 rounded-lg shadow-lg shadow-emerald-100">
              <ShieldCheckIcon className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-semibold text-gray-900 tracking-tight">
              HR<span className="text-emerald-600">MS</span>
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-gray-900 mt-4 tracking-tight">
            Welcome Back
          </h2>
        </div>

        {/* Form Card */}
        <div className="bg-white shadow-sm border border-gray-100 rounded-3xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-4">
              <h3 className={sectionHeaderStyle}>Account Credentials</h3>
              
              <div>
                <label className={labelStyle}>Email</label>
                <input 
                  type="email" 
                  name="email" 
                  required 
                  onChange={handleChange} 
                  placeholder="admin@company.com" 
                  className={inputStyle} 
                />
              </div>

              <div className="relative">
                <label className={labelStyle}>Password</label>
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password" 
                  required 
                  onChange={handleChange} 
                  placeholder="••••••••" 
                  className={inputStyle} 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-4 top-[38px] text-gray-400 hover:text-emerald-600"
                >
                  {showPassword ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button 
                disabled={loading} 
                className="w-full py-3 bg-emerald-600 text-white rounded-xl font-medium text-[15px] hover:bg-emerald-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {loading ? "Authenticating..." : <>Sign In <ArrowRightIcon className="h-4 w-4" /></>}
              </button>
              
              <div className="mt-6 text-center space-y-2">
                <p className="text-gray-500 text-sm">
                  Don't have an account? 
                  <Link to="/signup" className="text-emerald-600 hover:text-emerald-700 font-medium ml-1">Register Company</Link>
                </p>
                <Link to="/forgot-password" size="sm" className="text-xs text-gray-400 hover:text-emerald-600 transition-colors">
                  Forgot Password?
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;