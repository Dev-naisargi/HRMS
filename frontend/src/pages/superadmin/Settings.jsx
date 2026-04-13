import React, { useState } from "react";
import { User, Lock, Globe, Camera, Save } from "lucide-react";
import toast from "react-hot-toast";

const Settings = () => {
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState({ name: "Super Admin", email: "superadmin@gmail.com", role: "Super Admin" });
    const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
    const [preferences, setPreferences] = useState({ theme: "Light", language: "English", timezone: "UTC" });
    const [twoFactor, setTwoFactor] = useState(false);

    const handleSaveProfile = (e) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => { setLoading(false); toast.success("Profile updated successfully!"); }, 1000);
    };

    const handleSaveSecurity = (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            toast.error("New passwords do not match!");
            return;
        }
        setLoading(true);
        setTimeout(() => { setLoading(false); setPasswords({ current: "", new: "", confirm: "" }); toast.success("Password changed!"); }, 1000);
    };

    const inputStyle = "w-full text-sm px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/40 text-gray-800 dark:text-gray-100 transition-all";

    return (
        <div className="space-y-6 animate-fade-in max-w-5xl">

            {/* Header */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Platform Settings</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your account and global system preferences.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* 1. Profile Settings */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg">
                            <User size={20} />
                        </div>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">Profile Settings</h3>
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-full bg-emerald-200 dark:bg-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-200 font-bold text-xl relative overflow-hidden group">
                            {profile.name.charAt(0)}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <Camera size={16} className="text-white" />
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Profile Photo</p>
                            <p className="text-xs text-gray-500">JPG, GIF or PNG. Max size 2MB.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSaveProfile} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Full Name</label>
                            <input type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className={inputStyle} required />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Email Address</label>
                            <input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className={inputStyle} required />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">System Role</label>
                            <input type="text" value={profile.role} className={`${inputStyle} opacity-60 cursor-not-allowed`} readOnly disabled />
                        </div>
                        <button type="submit" disabled={loading} className="w-full mt-2 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-70">
                            <Save size={16} /> {loading ? "Saving..." : "Save Profile"}
                        </button>
                    </form>
                </div>

                {/* 2. Security Settings */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                            <Lock size={20} />
                        </div>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">Security Settings</h3>
                    </div>

                    <form onSubmit={handleSaveSecurity} className="space-y-4 mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Current Password</label>
                            <input type="password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} className={inputStyle} required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">New Password</label>
                                <input type="password" value={passwords.new} onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} className={inputStyle} required minLength={8} />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Confirm Password</label>
                                <input type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} className={inputStyle} required minLength={8} />
                            </div>
                        </div>
                        <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-gray-900 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200 hover:bg-gray-800 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-70">
                            Update Password
                        </button>
                    </form>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Two-Factor Authentication</p>
                            <p className="text-xs text-gray-500 mt-0.5">Require an extra security step on login.</p>
                        </div>
                        <button onClick={() => setTwoFactor(!twoFactor)} className={`w-11 h-6 rounded-full flex items-center transition-colors px-1 ${twoFactor ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'}`}>
                            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${twoFactor ? 'translate-x-5' : 'translate-x-0'}`}></div>
                        </button>
                    </div>
                </div>

                {/* 3. System Preferences */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg">
                            <Globe size={20} />
                        </div>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">System Preferences</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Global Theme</label>
                            <select value={preferences.theme} onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })} className={inputStyle}>
                                <option>Light</option>
                                <option>Dark</option>
                                <option>System Default</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Language</label>
                                <select value={preferences.language} onChange={(e) => setPreferences({ ...preferences, language: e.target.value })} className={inputStyle}>
                                    <option>English</option>
                                    <option>Spanish</option>
                                    <option>French</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Timezone</label>
                                <select value={preferences.timezone} onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })} className={inputStyle}>
                                    <option>UTC (Coordinated Universal Time)</option>
                                    <option>EST (Eastern Standard Time)</option>
                                    <option>PST (Pacific Standard Time)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Settings;
