import React, { useState, useEffect } from "react";
import Sidebar from "../../components/dashboard/Sidebar";
import Navbar from "../../components/dashboard/Navbar";
import EmployeeManagement from "./EmployeeManagement";
import AttendanceManagement from "./AttendanceManagement";
import LeaveManagement from "./LeaveManagement";
import PayrollManagement from "./PayrollManagement";
import api from "../../utils/api";
import { Users, UserCheck, Building2, Clock } from "lucide-react";

const HRDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    departments: 0,
    pendingLeaves: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/employees");
        const employees = res.data.employees || [];

        const uniqueDepartments = [
          ...new Set(employees.map((e) => e.department).filter(Boolean)),
        ];

        setStats({
          totalEmployees: employees.length,
          activeEmployees: employees.filter(
            (e) => e.status === "Active"
          ).length,
          departments: uniqueDepartments.length,
          pendingLeaves: 0,
        });
      } catch (err) {
        console.error("Failed to fetch stats", err);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">

      {/* SIDEBAR */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 flex flex-col">

        {/* NAVBAR */}
        <Navbar />

        <div className="p-8 space-y-8 overflow-y-auto">

          {/* DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="space-y-8">

              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Welcome, HR 👋
                </h1>

                <p className="text-gray-400 dark:text-gray-400 text-sm mt-1">
                  Overview of your organization.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

                <StatCard
                  icon={<Users size={20} />}
                  color="emerald"
                  label="Total Employees"
                  value={stats.totalEmployees}
                />

                <StatCard
                  icon={<UserCheck size={20} />}
                  color="blue"
                  label="Active Employees"
                  value={stats.activeEmployees}
                />

                <StatCard
                  icon={<Building2 size={20} />}
                  color="purple"
                  label="Departments"
                  value={stats.departments}
                />

                <StatCard
                  icon={<Clock size={20} />}
                  color="amber"
                  label="Pending Leaves"
                  value={stats.pendingLeaves}
                />

              </div>
            </div>
          )}

          {/* EMPLOYEE MANAGEMENT */}
          {activeTab === "employee" && <EmployeeManagement />}

          {/* ATTENDANCE MANAGEMENT */}
          {activeTab === "attendance" && <AttendanceManagement />}

          {/* LEAVE MANAGEMENT */}
          {activeTab === "leaves" && <LeaveManagement />}
            {/* payroll MANAGEMENT */}
          {activeTab === "payroll" && <PayrollManagement />}
        </div>
      </div>
    </div>
  );
};


/*  STAT CARD  */

const COLOR_MAP = {
  emerald:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300",

  blue:
    "bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300",

  purple:
    "bg-purple-50 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300",

  amber:
    "bg-amber-50 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300",
};

const StatCard = ({ icon, color, label, value }) => (
   <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 p-6 rounded-2xl shadow-sm hover:shadow-md transition">

    <div
      className={`w-10 h-10 flex items-center justify-center rounded-xl mb-4 ${COLOR_MAP[color]}`}
    >
      {icon}
    </div>

    <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
      {value}
    </h2>

    <p className="text-gray-400 text-sm mt-1 font-medium">
      {label}
    </p>

  </div>
);

export default HRDashboard;