import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";
import api from "../../utils/api";

const Signup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ companyName: "", companyAddress: "", adminEmail: "", password: "" });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/company/register", formData);
      alert("Registration Successful!");
      navigate("/login");
    } catch (error) {
      alert("Registration Failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-green-50/30 flex flex-col justify-center py-12 px-6 font-sans text-sm">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <Link to="/" className="inline-flex items-center gap-2 mb-4">
          <div className="bg-emerald-600 p-1.5 rounded-lg shadow-md shadow-emerald-100">
            <ShieldCheckIcon className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tighter text-gray-900">
            HR<span className="text-emerald-600">MS</span>
          </span>
        </Link>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Create Company Account</h2>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-10 px-8 shadow-xl shadow-emerald-900/5 border border-green-100 rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Company Name</label>
                <input type="text" name="companyName" required onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Company Address</label>
                <input type="text" name="companyAddress" required onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Admin Email</label>
              <input type="email" name="adminEmail" required onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Password</label>
              <input type="password" name="password" required onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition" />
            </div>
            <button disabled={loading} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200">
              {loading ? "Registering..." : "Register Company"}
            </button>
          </form>
          <p className="mt-8 text-center font-medium text-gray-500 italic">Already have an account? <Link to="/login" className="text-emerald-600 font-bold hover:underline not-italic">Sign In</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Signup;