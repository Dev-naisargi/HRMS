import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShieldCheckIcon, EyeIcon, EyeSlashIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast"; // 1. Import toast
import api from "../../utils/api";

const Signup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    companyName: "", companyAddress: "", companyPhone: "",
    adminName: "", adminEmail: "", password: "", confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    let newErrors = {};
    if (formData.companyPhone.length < 10) newErrors.companyPhone = "Invalid phone number";
    if (formData.password.length < 6) newErrors.password = "Min. 6 characters";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords mismatch";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fix the errors in the form"); // 2. Error Toast
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    const loadingToast = toast.loading("Creating your account..."); // 3. Loading Toast
    setLoading(true);
    
    try {
      await api.post("/company/register", formData);
      toast.success("Company registered successfully!", { id: loadingToast }); // 4. Success Toast
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      const msg = error.response?.data?.message || "Registration Failed";
      toast.error(msg, { id: loadingToast }); // 5. Failure Toast
    } finally { 
      setLoading(false); 
    }
  };

  const sectionHeaderStyle = "text-[13px] font-bold text-emerald-700 mb-3 border-b border-emerald-50 pb-1";
  const labelStyle = "block text-[12px] font-medium text-gray-600 mb-1.5 ml-0.5";
  const inputStyle = (fieldName) => `
    w-full px-4 py-2.5 bg-white border rounded-xl outline-none transition-all text-[14px] text-gray-800
    ${errors[fieldName] ? "border-red-400 focus:ring-1" : "border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"}
  `;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-10 px-4 font-sans antialiased">
      {/* 6. Add Toaster component here */}
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
            Create Company Account
          </h2>
        </div>

        {/* Form Card */}
        <div className="bg-white shadow-sm border border-gray-100 rounded-3xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-3">
              <h3 className={sectionHeaderStyle}>Company Details</h3>
              <div>
                <label className={labelStyle}>Company Name</label>
                <input type="text" name="companyName" required onChange={handleChange} placeholder="e.g. Acme Corp" className={inputStyle("companyName")} />
              </div>
              <div>
                <label className={labelStyle}>Company Address</label>
                <input type="text" name="companyAddress" required onChange={handleChange} placeholder="HQ Location" className={inputStyle("companyAddress")} />
              </div>
              <div>
                <label className={labelStyle}>Company Phone</label>
                <input type="tel" name="companyPhone" required onChange={handleChange} placeholder="Contact Number" className={inputStyle("companyPhone")} />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className={sectionHeaderStyle}>Admin Details</h3>
              <div>
                <label className={labelStyle}>Admin Name</label>
                <input type="text" name="adminName" required onChange={handleChange} placeholder="Full Name" className={inputStyle("adminName")} />
              </div>
              <div>
                <label className={labelStyle}>Work Email</label>
                <input type="email" name="adminEmail" required onChange={handleChange} placeholder="admin@company.com" className={inputStyle("adminEmail")} />
              </div>
              
              <div className="relative">
                <label className={labelStyle}>Password</label>
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password" required onChange={handleChange} placeholder="••••••••" className={inputStyle("password")} 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-[38px] text-gray-400">
                  {showPassword ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>

              <div className="relative">
                <label className={labelStyle}>Confirm Password</label>
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  name="confirmPassword" required onChange={handleChange} placeholder="••••••••" className={inputStyle("confirmPassword")} 
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-[38px] text-gray-400">
                  {showConfirmPassword ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="pt-4">
              <button 
                disabled={loading} 
                className="w-full py-3 bg-emerald-600 text-white rounded-xl font-medium text-[15px] hover:bg-emerald-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {loading ? "Processing..." : <>Register Company <ArrowRightIcon className="h-4 w-4" /></>}
              </button>
              
              <p className="mt-6 text-center text-gray-500 text-sm">
                Already registered? <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-medium">Log In</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;