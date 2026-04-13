import React, { useState, useEffect, useRef } from "react";
import { googleLogout } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { LogOut, User, ChevronDown } from "lucide-react";
import api from "../../utils/api";
import ThemeToggle from "../ThemeToggle";

const Navbar = () => {
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown]         = useState(false);
    const [user, setUser]                         = useState(null);
    const dropdownRef                             = useRef(null);

    /* ── Fetch user profile ── */
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;
                const res = await api.get("/auth/me");
                setUser(res.data?.user ?? res.data);
            } catch (err) {
                const status = err?.response?.status;
                if ([401, 404].includes(status)) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("role");
                    window.location.href = "/login";
                } else {
                    if (status !== 403) console.error("Failed to fetch profile", err?.response?.data || err?.message);
                    setUser(null);
                }
            }
        };
        fetchProfile();
    }, []);

    /* ── Close dropdowns on outside click ── */
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        googleLogout();
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/", { replace: true });
    };

    const getInitials = (name) => {
        if (!name) return "U";
        return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    };

    return (
        <div className="h-16 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-8 sticky top-0 z-50 transition-colors duration-300">

            <h1 className="font-semibold text-gray-700 dark:text-gray-100">
                Company Dashboard
            </h1>

            <div className="flex items-center gap-4">
                <ThemeToggle />

                {/* ── Profile Dropdown (original, unchanged) ── */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => { setShowDropdown(!showDropdown); }}
                        className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 px-3 py-2 rounded-xl transition-all"
                    >
                        <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-full flex items-center justify-center font-bold text-sm">
                            {getInitials(user?.name)}
                        </div>
                        <div className="text-left hidden md:block">
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 leading-none">
                                {user?.name || "Loading..."}
                            </p>
                            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                                {user?.role || ""}
                            </p>
                        </div>
                        <ChevronDown size={14} className="text-gray-400 dark:text-gray-500" />
                    </button>

                    {showDropdown && (
                        <div className="absolute right-0 top-14 w-56 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden z-50 transition-colors duration-300">
                            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-800">
                                <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{user?.name}</p>
                                <p className="text-[11px] text-gray-400 dark:text-gray-500">{user?.email}</p>
                            </div>
                            <div className="p-2">
                                <button
                                    onClick={() => { setShowDropdown(false); navigate("/profile"); }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                                >
                                    <User size={15} className="text-gray-400 dark:text-gray-500" /> View Profile
                                </button>

                            </div>
                            <div className="p-2 border-t border-gray-100 dark:border-gray-800">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all"
                                >
                                    <LogOut size={15} /> Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Navbar;