import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Settings,
    FileText,
    CreditCard,
    Clock,
    CalendarDays,
    UserCircle
} from 'lucide-react';

const Sidebar = ({ role }) => {
    const menuItems = [
        { icon: LayoutDashboard, label: 'Overview', path: '/dashboard', roles: ['ADMIN', 'HR', 'EMPLOYEE'] },
        { icon: Users, label: 'Employees', path: '/dashboard/employees', roles: ['ADMIN', 'HR'] },
        { icon: Clock, label: 'Attendance', path: '/dashboard/attendance', roles: ['HR', 'EMPLOYEE'] },
        { icon: CalendarDays, label: 'Leave', path: '/dashboard/leave', roles: ['ADMIN', 'HR', 'EMPLOYEE'] },
        { icon: CreditCard, label: 'Payroll', path: '/dashboard/payroll', roles: ['ADMIN', 'EMPLOYEE'] },
        { icon: FileText, label: 'Reports', path: '/dashboard/reports', roles: ['ADMIN'] },
        { icon: UserCircle, label: 'My Profile', path: '/profile', roles: ['EMPLOYEE'] },
      
    ];

    const allowedItems = menuItems.filter(item => item.roles.includes(role));

    return (
<div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 h-[calc(100vh-4rem)] flex flex-col shadow-sm fixed left-0 top-16 z-40">            <div className="p-6">
                <h1 className="text-2xl font-bold flex items-center gap-2 tracking-tight text-gray-800 dark:text-white">
                    <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-lg font-bold">H</span>
                    </div>
                    HRMS
                </h1>
            </div>
            <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
                {allowedItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/dashboard'}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${isActive
                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400 font-semibold'
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800/60'
                            }`
                        }
                    >
                        <item.icon size={20} className="shrink-0" />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>
            {/* Footer Profile Info */}
            <div className="p-4 border-t border-gray-50 dark:border-gray-800 m-4 mt-auto">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-600 font-bold shrink-0 shadow-sm">
                        {role.charAt(0)}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">{role}</p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate uppercase tracking-wider">Workspace</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
