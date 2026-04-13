import React, { useState } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import Navbar from '../components/dashboard/Navbar';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const TAB_ROUTE_MAP = {
    dashboard: '/dashboard',
    hr: '/dashboard/hr',
    employee: '/dashboard/employees',
    attendance: '/dashboard/attendance',
    leaves: '/dashboard/leave',
    payroll: '/dashboard/payroll',
    reports: '/dashboard/reports',
    settings: '/dashboard/settings',
};

const DashboardLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const getActiveTabFromPath = () => {
        const path = location.pathname;
        if (path === '/dashboard') return 'dashboard';
        if (path.endsWith('/hr') || path.endsWith('/hr/')) return 'hr';
        if (path.includes('employees')) return 'employee';
        if (path.includes('attendance')) return 'attendance';
        if (path.includes('leave')) return 'leaves';
        if (path.includes('payroll')) return 'payroll';
        if (path.includes('reports')) return 'reports';
        if (path.includes('settings')) return 'settings';
        return 'dashboard';
    };

    const [activeTab, setActiveTab] = useState(getActiveTabFromPath());

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        const route = TAB_ROUTE_MAP[tab] || '/dashboard';
        navigate(route);
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
            
            {/* Sidebar (fixed) */}
            <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} />

            {/* Main Content */}
<div className="fixed top-0 left-64 right-0 h-16 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
    <Navbar />
</div>
                {/* Scroll only this area */}
<main className="flex-1 p-8 space-y-6 overflow-y-auto mt-16">                    <Outlet />
                </main>
            </div>
        
    );
};

export default DashboardLayout;