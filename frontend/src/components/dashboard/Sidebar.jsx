import React from "react";
import {
  LayoutDashboard,
  UserCircle,
  Users,
  CalendarCheck,
  FileSpreadsheet,
  BarChart3,
  Wallet,
  Building2,
  CreditCard,
  Activity,
  Settings
} from "lucide-react";

const Sidebar = ({ activeTab, setActiveTab }) => {

  const roleFromStorage = localStorage.getItem("role");
  const userRole = roleFromStorage ? roleFromStorage.toUpperCase() : "EMPLOYEE";

  const menuConfig = [
    { id: "dashboard", label: "Dashboard Overview", icon: <LayoutDashboard size={18} />, roles: ["ADMIN", "HR", "EMPLOYEE", "SUPER_ADMIN"] },
    { id: "companies", label: "Company Management", icon: <Building2 size={18} />, roles: ["SUPER_ADMIN"] },
    { id: "hr", label: "HR Management", icon: <UserCircle size={18} />, roles: ["ADMIN", "SUPER_ADMIN"] },
    { id: "employee", label: "Employee Analytics", icon: <Users size={18} />, roles: ["HR", "SUPER_ADMIN"] },
    { id: "reports", label: "System Reports", icon: <BarChart3 size={18} />, roles: ["ADMIN", "SUPER_ADMIN"] },
    { id: "attendance", label: "Attendance", icon: <CalendarCheck size={18} />, roles: ["HR", "EMPLOYEE"] },
    { id: "leaves", label: "Leave", icon: <FileSpreadsheet size={18} />, roles: ["HR", "EMPLOYEE"] },
    { id: "payroll", label: "Payroll", icon: <Wallet size={18} />, roles: ["ADMIN", "HR", "EMPLOYEE"] },
    { id: "subscriptions", label: "Subscriptions / Plans", icon: <CreditCard size={18} />, roles: ["SUPER_ADMIN"] },
    { id: "activity", label: "Activity Logs", icon: <Activity size={18} />, roles: ["SUPER_ADMIN"] },
    { id: "settings", label: "Settings", icon: <Settings size={18} />, roles: ["SUPER_ADMIN"] },
  ];

  const filteredMenu = menuConfig.filter(item => item.roles.includes(userRole));

  return (
    <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 min-h-screen p-6 shadow-sm transition-colors duration-300">

      <h2 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mb-8 tracking-tight text-center">
        {userRole} Panel
      </h2>

      <nav className="space-y-2">
        {filteredMenu.map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-3 cursor-pointer p-3 rounded-xl transition-all font-medium ${activeTab === item.id
              ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-emerald-600 dark:hover:text-emerald-400"
              }`}
          >
            {item.icon}
            {item.label}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;