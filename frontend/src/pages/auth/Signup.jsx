import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShieldCheckIcon, EyeIcon, EyeSlashIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";
import api from "../../utils/api";

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Basic state for form inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Basic state for error messages
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // --- SIMPLE VALIDATION START ---
    let isValid = true;

    // Check Email
    if (email === "") {
      setEmailError("Email is required");
      isValid = false;
    } else if (!email.includes("@")) {
      setEmailError("Please enter a valid email");
      isValid = false;
    } else {
      setEmailError("");
    }

    // Check Password
    if (password === "") {
      setPasswordError("Password is required");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      isValid = false;
    } else {
      setPasswordError("");
    }

    if (isValid === false) {
      toast.error("Please fix the errors");
      return;
    }
    // --- SIMPLE VALIDATION END ---

    const loadingToast = toast.loading("Checking your details...");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", { 
        email: email, 
        password: password 
      });
      
      toast.success("Login Successful!", { id: loadingToast });
      
      // Save the token so the user stays logged in
      localStorage.setItem("token", response.data.token);
      
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (error) {
      const msg = error.response?.data?.message || "Invalid Email or Password";
      toast.error(msg, { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  // Basic Styles
  const labelStyle = "block text-[12px] font-medium text-gray-600 mb-1.5 ml-0.5";
  const inputStyle = "w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none text-[14px] text-gray-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10";
  const errorTextStyle = "text-[11px] text-red-500 mt-1 ml-1";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-10 px-4 font-sans">
      <Toaster position="top-center" />

      <div className="w-full max-w-[440px]">
        {/* Branding */}
        <div className="flex flex-col items-center mb-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-emerald-600 p-2 rounded-lg shadow-lg">
              <ShieldCheckIcon className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-semibold text-gray-900">
              HR<span className="text-emerald-600">MS</span>
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-gray-900 mt-4">Welcome Back</h2>
        </div>

        {/* Card */}
        <div className="bg-white shadow-sm border border-gray-100 rounded-3xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-4">
              <h3 className="text-[13px] font-bold text-emerald-700 mb-3 border-b border-emerald-50 pb-1">
                Account Credentials
              </h3>
              
              {/* Email Field */}
              <div>
                <label className={labelStyle}>Admin Email</label>
                <input 
                  type="text" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="admin@company.com" 
                  className={inputStyle} 
                />
                {emailError && <p className={errorTextStyle}>{emailError}</p>}
              </div>

              {/* Password Field */}
              <div className="relative">
                <label className={labelStyle}>Password</label>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  className={inputStyle} 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-4 top-[38px] text-gray-400"
                >
                  {showPassword ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
                {passwordError && <p className={errorTextStyle}>{passwordError}</p>}
              </div>
            </div>

            <button 
              disabled={loading} 
              className="w-full py-3 bg-emerald-600 text-white rounded-xl font-medium text-[15px] hover:bg-emerald-700 transition-all active:scale-[0.95] flex items-center justify-center gap-2"
            >
              {loading ? "Checking..." : <>Sign In <ArrowRightIcon className="h-4 w-4" /></>}
            </button>
            
            <p className="mt-6 text-center text-gray-500 text-sm">
              Don't have an account? 
              <Link to="/signup" className="text-emerald-600 font-medium ml-1">Register Company</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;