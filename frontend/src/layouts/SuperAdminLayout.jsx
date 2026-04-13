import React from 'react';
import SuperAdminDashboard from '../pages/superadmin/SuperAdminDashboard';

// SuperAdmin already manages its own internal tab-based navigation
// No separate Outlet needed – SuperAdminDashboard controls all sub-panels internally.
const SuperAdminLayout = () => {
    return <SuperAdminDashboard />;
};

export default SuperAdminLayout;
