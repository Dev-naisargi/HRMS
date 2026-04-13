import React, { useEffect, useState } from 'react';
import { Sun, Moon, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    const [theme, setTheme]                   = useState(localStorage.getItem('theme') || 'light');
    const navigate                            = useNavigate();

    /* ── Theme ── */
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [theme]);

    const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');


    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate('/login');
    };

    const userName  = localStorage.getItem('userName') || 'User';
    const userRole  = localStorage.getItem('role') || 'EMPLOYEE';
    return (
        <header className="h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-8 flex items-center justify-between shadow-sm">
            
            {/* Left — Company Dashboard label */}
            <div className="flex-1">
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Company Dashboard</p>
            </div>

            {/* Right — actions */}
            <div className="flex items-center gap-3">

                {/* Theme toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
                >
                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </button>

                <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-1" />

                {/* User info + logout */}
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                        {userName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="hidden md:block">
                        <p className="text-sm font-semibold text-gray-800 dark:text-white leading-none">{userName}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5 uppercase tracking-wide">{userRole}</p>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 py-2 px-3 rounded-xl transition-all group"
                >
                    <LogOut size={18} className="text-gray-400 group-hover:text-red-500" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Logout</span>
                </button>
            </div>
        </header>
    );
};

export default Navbar;