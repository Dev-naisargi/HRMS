import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Mail, Phone, Building2,
  Calendar, Shield, Pencil, Check, X
} from "lucide-react";
import api from "../../utils/api";

const AVATAR_COLORS = [
  "from-emerald-400 to-teal-500",
  "from-blue-400 to-indigo-500",
  "from-purple-400 to-pink-500",
  "from-amber-400 to-orange-500",
];

const getGradient = (name) =>
  AVATAR_COLORS[name?.charCodeAt(0) % AVATAR_COLORS.length] || AVATAR_COLORS[0];

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [formData, setFormData] = useState({
  name: "",
  phone: "",
  department: "",
  dob: "",
  doj: ""
});

  const triggerToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data.user);
        
        setFormData({
  name: res.data.user.name || "",
  phone: res.data.user.phone || "",
  department: res.data.user.department || "",
  dob: res.data.user.dob ? res.data.user.dob.split("T")[0] : "",
  doj: res.data.user.doj ? res.data.user.doj.split("T")[0] : ""
});
      } catch (err) {
        console.error("Failed to fetch profile");
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await api.put("/auth/update-profile", formData);
      setUser(res.data.user);
      setIsEditing(false);
      triggerToast("Profile updated successfully!");
    } catch (err) {
      triggerToast(err.response?.data?.message || "Update failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const role = localStorage.getItem("role");

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

      {/* Toast */}
      {toast.show && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[500] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border ${
          toast.type === "success"
            ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/70 dark:border-emerald-700 dark:text-emerald-200"
            : "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/70 dark:border-red-700 dark:text-red-200"
        }`}>
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Top Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-8 h-16 flex items-center gap-4">
        <button
          onClick={() => navigate(role === "HR" ? "/hr/dashboard" : "/admin/dashboard")}
          className="flex items-center gap-2 text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-all text-sm font-medium"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">

        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">

          {/* Banner */}
          <div className={`h-32 bg-gradient-to-r ${getGradient(user.name)}`} />

          {/* Avatar + Info */}
          <div className="px-8 pb-8">
            <div className="flex items-end justify-between -mt-12 mb-6">

              <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${getGradient(user.name)} flex items-center justify-center text-white text-3xl font-bold border-4 border-white dark:border-gray-800 shadow-lg`}>
                {user.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
              </div>

              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-all"
                >
                  <Pencil size={14} /> Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                  >
                    <X size={14} /> Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-all disabled:bg-gray-300"
                  >
                    <Check size={14} /> {loading ? "Saving..." : "Save"}
                  </button>
                </div>
              )}
            </div>

            {/* Name & Role */}
            {isEditing ? (
              <input
                value={formData.name}
                onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                className="text-2xl font-bold text-gray-800 dark:text-white border-b-2 border-emerald-400 outline-none bg-transparent w-full mb-1"
              />
            ) : (
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{user.name}</h2>
            )}

            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                user.role === "ADMIN"
                  ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
                  : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
              }`}>
                <Shield size={10} />
                {user.role}
              </span>
              {user.company?.companyName && (
                <span className="text-xs text-gray-400 font-medium">{user.company.companyName}</span>
              )}
            </div>
          </div>
        </div>

        {/* Details Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm p-8">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Personal Information</h3>

          <div className="grid md:grid-cols-2 gap-6">

            {/* Email */}
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-900/40 rounded-xl">
                <Mail size={16} className="text-blue-500 dark:text-blue-300" />
              </div>
              <div className="flex-1">
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Email</p>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mt-0.5">{user.email}</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/40 rounded-xl">
                <Phone size={16} className="text-emerald-500 dark:text-emerald-300" />
              </div>
              <div className="flex-1">
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Phone</p>
                {isEditing ? (
                  <input
                    value={formData.phone}
                    onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                    className="text-sm font-semibold text-gray-700 dark:text-gray-200 border-b border-emerald-400 outline-none bg-transparent w-full mt-0.5"
                  />
                ) : (
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mt-0.5">{user.phone || "—"}</p>
                )}
              </div>
            </div>

            {/* Department */}
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-purple-50 dark:bg-purple-900/40 rounded-xl">
                <Building2 size={16} className="text-purple-500 dark:text-purple-300" />
              </div>
              <div className="flex-1">
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Department</p>
                {isEditing ? (
                  <input
                    value={formData.department}
                    onChange={(e) => setFormData(p => ({ ...p, department: e.target.value }))}
                    className="text-sm font-semibold text-gray-700 dark:text-gray-200 border-b border-emerald-400 outline-none bg-transparent w-full mt-0.5"
                  />
                ) : (
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mt-0.5">{user.department || "—"}</p>
                )}
              </div>
            </div>

            {/* DOB */}
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-amber-50 dark:bg-amber-900/40 rounded-xl">
                <Calendar size={16} className="text-amber-500 dark:text-amber-300" />
              </div>
              <div className="flex-1">
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Date of Birth</p>
                {isEditing ? (
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData(p => ({ ...p, dob: e.target.value }))}
                    className="text-sm font-semibold text-gray-700 dark:text-gray-200 border-b border-emerald-400 outline-none bg-transparent w-full mt-0.5"
                  />
                ) : (
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mt-0.5">{user.dob ? new Date(user.dob).toLocaleDateString("en-IN") : "—"}</p>
                )}
              </div>
            </div>

            {/* Joining Date */}
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-teal-50 dark:bg-teal-900/40 rounded-xl">
                <Calendar size={16} className="text-teal-500 dark:text-teal-300" />
              </div>
              <div className="flex-1">
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Joining Date</p>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mt-0.5">{user.doj ? new Date(user.doj).toLocaleDateString() : "—"}</p>
              </div>
            </div>

            {/* Role */}
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-rose-50 dark:bg-rose-900/40 rounded-xl">
                <Shield size={16} className="text-rose-500 dark:text-rose-300" />
              </div>
              <div className="flex-1">
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Role</p>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mt-0.5">{user.role}</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;