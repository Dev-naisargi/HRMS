import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Shield,
  Pencil,
  CalendarDays,
  KeyRound,
  Upload,
  Check,
  X,
  Loader2,
} from "lucide-react";
import api from "../../utils/api";

const AVATAR_COLORS = [
  "from-emerald-600 to-teal-500",
  "from-emerald-500 to-green-600",
  "from-teal-600 to-emerald-500",
  "from-green-600 to-emerald-500",
];

const fieldConfigs = {
  SUPER_ADMIN: [
    { label: "Full Name", key: "name", type: "text", editable: true },
    { label: "Phone Number", key: "phone", type: "text", editable: true },
  ],
  ADMIN: [
    { label: "Full Name", key: "name", type: "text", editable: true },
    { label: "Phone Number", key: "phone", type: "text", editable: true },
  ],
  HR: [
    { label: "Full Name", key: "name", type: "text", editable: true },
    { label: "Phone Number", key: "phone", type: "text", editable: true },
  ],
  EMPLOYEE: [
    { label: "Full Name", key: "name", type: "text", editable: true },
    { label: "Phone Number", key: "phone", type: "text", editable: true },
    { label: "Date of Birth", key: "dob", type: "date", editable: true },
  ],
};

const getGradient = (name) => AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];

const formatDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN");
};

const formatDateForInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
};

const getBackPathByRole = (role) => (role === "SUPER_ADMIN" ? "/superadmin" : "/dashboard");

const toEditableShape = (source = {}, role) => {
  const editableKeys = fieldConfigs[role]?.filter((f) => f.editable).map((f) => f.key) || [];
  const shape = {};
  editableKeys.forEach((key) => {
    shape[key] = key === "dob" ? formatDateForInput(source?.[key]) : source?.[key] || "";
  });
  return shape;
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [formData, setFormData] = useState({ name: "", phone: "", dob: "" });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const role = user?.role?.toUpperCase() || "";
  const companyName = user?.companyId?.name || user?.company?.name || "Not assigned";
  const configs = fieldConfigs[role] || fieldConfigs.SUPER_ADMIN;

  const initials = useMemo(
    () =>
      user?.name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "U",
    [user?.name]
  );

  const hasChanges = useMemo(() => {
    if (!user) return false;
    const baseline = toEditableShape(user, role);
    const editableKeys = configs.filter((f) => f.editable).map((f) => f.key);
    return editableKeys.some((key) => baseline[key] !== formData[key]);
  }, [user, role, configs, formData]);

  const triggerToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 2600);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login", { replace: true });
          return;
        }
        const res = await api.get("/auth/me");
        const userData = res.data?.user ?? res.data;
        setUser(userData);
        setFormData(toEditableShape(userData, userData?.role?.toUpperCase()));
      } catch {
        triggerToast("Profile load failed", "error");
      } finally {
        setPageLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleAvatarSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result?.toString() || "");
    reader.readAsDataURL(file);
    triggerToast("Avatar preview updated");
  };
const handleRemoveAvatar = () => {
  setAvatarPreview("");
  if (fileInputRef.current) {
    fileInputRef.current.value = "";
  }
  triggerToast("Avatar removed");
};
  const handleStartEdit = () => {
    setFormData(toEditableShape(user, role));
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setFormData(toEditableShape(user, role));
    setIsEditing(false);
  };

  const handleSaveProfile = async () => {
    if (!formData.name?.trim()) return triggerToast("Name is required", "error");
    if (formData.phone && !/^[0-9]{10}$/.test(formData.phone.trim())) {
      return triggerToast("Phone must be exactly 10 digits", "error");
    }
    if (formData.dob) {
      const dob = new Date(formData.dob);
      if (Number.isNaN(dob.getTime()) || dob > new Date()) {
        return triggerToast("Please enter a valid date of birth", "error");
      }
    }
    if (!hasChanges) return triggerToast("No changes to save", "error");

    setProfileLoading(true);
    try {
      const baseline = toEditableShape(user, role);
      const updateData = {};

      configs
        .filter((f) => f.editable)
        .forEach((f) => {
          const nextValue =
            typeof formData[f.key] === "string" ? formData[f.key].trim() : formData[f.key];
          if (baseline[f.key] !== nextValue) updateData[f.key] = nextValue;
        });

      const res = await api.put("/auth/update-profile", updateData);
      const updatedUser = res.data?.user ?? res.data;
      setUser(updatedUser);
      setFormData(toEditableShape(updatedUser, updatedUser?.role?.toUpperCase()));
      setIsEditing(false);
      triggerToast("Profile updated successfully");
    } catch (err) {
      triggerToast(err?.response?.data?.message || "Unable to update profile", "error");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordForm;
    if (!currentPassword || !newPassword || !confirmPassword) {
      return triggerToast("All password fields are required", "error");
    }
    if (newPassword !== confirmPassword) {
      return triggerToast("New password and confirm password do not match", "error");
    }

    setPasswordLoading(true);
    try {
      await api.put("/auth/change-password", passwordForm);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      triggerToast("Password updated successfully");
    } catch (err) {
      triggerToast(err?.response?.data?.message || "Unable to update password", "error");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 text-gray-600 dark:text-gray-300">
        Unable to load profile.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300">
      {toast.show && (
        <div
          className={`fixed top-5 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 rounded-xl border text-sm font-medium shadow-lg ${
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-200 dark:border-emerald-700"
              : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/50 dark:text-red-200 dark:border-red-700"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/70 backdrop-blur">
        <div className="max-w-6xl mx-auto h-12 px-4 md:px-6 flex items-center justify-between">
          <button
            onClick={() => navigate(getBackPathByRole(role))}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full px-4 md:px-6 py-3">
        <div className="flex flex-col gap-3">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
            <div className={`h-12 bg-gradient-to-r ${getGradient(user?.name)}`} />
            <div className="px-4 md:px-5 py-3 -mt-3.5">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl border-2 border-white dark:border-gray-900 bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-base font-bold text-gray-800 dark:text-gray-100 overflow-hidden shrink-0 shadow-sm">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </div>

                <div className="flex-1 min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">{user?.name}</h1>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                    <Shield size={12} />
                    {role || "USER"}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                    <Building2 size={12} />
                    {companyName}
                  </span>
                </div>
              </div>

               <div className="ml-auto flex gap-2">
  <input
    ref={fileInputRef}
    type="file"
    accept="image/*"
    onChange={handleAvatarSelect}
    className="hidden"
  />

  <button
    onClick={() => fileInputRef.current?.click()}
    className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
  >
    <Upload size={14} />
    Change
  </button>

  {avatarPreview && (
    <button
      onClick={handleRemoveAvatar}
      className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600"
    >
      <X size={14} />
      Remove
    </button>
  )}
</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-10 gap-3 items-start">
            <div className="lg:col-span-7 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-4">
              <div className="flex items-center justify-between gap-3 mb-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Profile Details</h2>
            {!isEditing ? (
              <button
                onClick={handleStartEdit}
                className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700"
              >
                <Pencil size={13} />
                Edit Profile
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancelEdit}
                  disabled={profileLoading}
                  className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                >
                  <X size={13} />
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={profileLoading || !hasChanges}
                  className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50"
                >
                  {profileLoading ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                  {profileLoading ? "Saving..." : "Save"}
                </button>
              </div>
            )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <DetailOrInput
              icon={Mail}
              label="Email"
              value={user?.email || "—"}
              readOnly
            />
            <DetailOrInput
              icon={Phone}
              label="Phone"
              value={isEditing ? formData.phone : user?.phone || "Not set"}
              editing={isEditing}
              type="text"
              onChange={(value) => setFormData((prev) => ({ ...prev, phone: value }))}
            />
            <DetailOrInput
              icon={Building2}
              label="Department"
              value={user?.department || "Not set"}
              readOnly
            />
            <DetailOrInput
              icon={CalendarDays}
              label="Joining Date"
              value={formatDate(user?.doj)}
              readOnly
            />
            <DetailOrInput
              icon={Pencil}
              label="Full Name"
              value={isEditing ? formData.name : user?.name || "—"}
              editing={isEditing}
              type="text"
              onChange={(value) => setFormData((prev) => ({ ...prev, name: value }))}
            />
            {configs.some((f) => f.key === "dob") ? (
              <DetailOrInput
                icon={CalendarDays}
                label="Date of Birth"
                value={isEditing ? formData.dob : formatDate(user?.dob)}
                editing={isEditing}
                type="date"
                onChange={(value) => setFormData((prev) => ({ ...prev, dob: value }))}
              />
            ) : (
              <DetailOrInput
                icon={CalendarDays}
                label="Date of Birth"
                value={formatDate(user?.dob)}
                readOnly
              />
            )}
              </div>
            </div>

            <div className="lg:col-span-3 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-4 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
            <KeyRound size={14} className="text-emerald-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Change Password</h2>
              </div>

              <div className="grid grid-cols-1 gap-3">
            <InputField
              label="Current Password"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(value) => setPasswordForm((prev) => ({ ...prev, currentPassword: value }))}
            />
            <InputField
              label="New Password"
              type="password"
              value={passwordForm.newPassword}
              onChange={(value) => setPasswordForm((prev) => ({ ...prev, newPassword: value }))}
            />
            <InputField
              label="Confirm New Password"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(value) => setPasswordForm((prev) => ({ ...prev, confirmPassword: value }))}
            />
              </div>

              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Password must include uppercase, lowercase, number, and special character.
              </p>

              <div className="pt-3 flex justify-end">
            <button
              onClick={handleChangePassword}
              disabled={passwordLoading}
              className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg bg-gray-900 text-white dark:bg-white dark:text-gray-900 text-sm font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {passwordLoading && <Loader2 size={13} className="animate-spin" />}
              {passwordLoading ? "Updating..." : "Update Password"}
            </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailOrInput = ({ icon, label, value, editing = false, readOnly = false, onChange, type = "text" }) => {
  const IconComponent = icon;

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/50 p-3 min-h-[84px] flex flex-col justify-between">
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">{label}</p>
      <div className="flex items-center gap-2 min-h-[38px]">
        <IconComponent size={14} className="text-emerald-500 shrink-0 mt-0.5" />
        {editing && !readOnly ? (
          <input
            type={type}
            value={value || ""}
            onChange={(e) => onChange?.(e.target.value)}
            className="w-full h-9 px-3 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800"
          />
        ) : (
          <span className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{value || "—"}</span>
        )}
      </div>
    </div>
  );
};

const InputField = ({ label, value, onChange, type = "text" }) => (
  <label className="block">
    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">{label}</p>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-9 px-3 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800"
    />
  </label>
);

export default ProfilePage;