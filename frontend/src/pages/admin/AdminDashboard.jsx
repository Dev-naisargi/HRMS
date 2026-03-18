import React, { useState, useEffect } from "react";
import ThemeToggle from "../../components/ThemeToggle";
import Sidebar from "../../components/dashboard/Sidebar";
import Navbar from "../../components/dashboard/Navbar";
import HRmanagement from "./HRmanagement";
import Reports from "./reports/Report";
import {
  Users,
  UserCheck,
  Building2,
  Clock,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import api from "../../utils/api";

/* SAMPLE DATA */



const COLORS = ["#10B981", "#F59E0B", "#EF4444"];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [attendanceData, setAttendanceData] = useState([]);
  const [leaveData, setLeaveData] = useState([]);
  const [stats, setStats] = useState({
    totalHR: 0,
    totalEmployees: 0,
    departments: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        /*  STATS  */
        const statsRes = await api.get("/admin/stats");
        setStats(statsRes.data);

        /*  CHARTS  */
        const chartRes = await api.get("/admin/charts");

        console.log("Chart API:", chartRes.data); // ✅ debug

        const data = chartRes.data;

        setAttendanceData([
          { name: "Present", value: data?.attendance?.present || 0 },
          { name: "Absent", value: data?.attendance?.absent || 0 },
          { name: "Late", value: data?.attendance?.late || 0 },
        ]);

        setLeaveData([
          { name: "Approved", value: data?.leaves?.approved || 0 },
          { name: "Pending", value: data?.leaves?.pending || 0 },
          { name: "Rejected", value: data?.leaves?.rejected || 0 },
        ]);

      } catch (err) {
        console.error("Dashboard error", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">

      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <div className="p-8 space-y-10">

          {activeTab === "dashboard" && (
            <>
              {/* Header */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Welcome, Admin 👋
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  Company analytics overview.
                </p>
              </div>

              {/* Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

                <StatCard
                  icon={<UserCheck size={20} />}
                  label="Total HR"
                  value={stats.totalHR}
                  color="emerald"
                />

                <StatCard
                  icon={<Users size={20} />}
                  label="Total Employees"
                  value={stats.totalEmployees}
                  color="blue"
                />

                <StatCard
                  icon={<Building2 size={20} />}
                  label="Departments"
                  value={stats.departments}
                  color="purple"
                />

                <StatCard
                  icon={<Clock size={20} />}
                  label="Pending Leaves"
                  value={25}
                  color="amber"
                />
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                {/* Attendance Chart */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm transition-colors">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-6">
                    Attendance Overview
                  </h3>

                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={attendanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip />
                      <Bar
                        dataKey="value"
                        fill="#10B981"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Leave Chart */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm transition-colors">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-6">
                    Leave Distribution
                  </h3>

                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={leaveData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={4}
                      >
                        {leaveData.map((entry, index) => (
                          <Cell key={index} fill={COLORS[index]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

              </div>
            </>
          )}

          {activeTab === "hr" && <HRmanagement />}
          {activeTab === "reports" && <Reports />}

        </div>
      </div>
    </div>
  );
};

/*  STAT CARD  */

const StatCard = ({ icon, label, value, color }) => {
  const iconStyles = {
    emerald: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600",
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600",
    purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600",
    amber: "bg-amber-100 dark:bg-amber-900/30 text-amber-600",
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 p-6 rounded-2xl shadow-sm hover:shadow-md transition">

      <div className={`w-10 h-10 flex items-center justify-center rounded-xl mb-4 ${iconStyles[color]}`}>
        {icon}
      </div>

      <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        {value}
      </h2>

      <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 font-medium">
        {label}
      </p>

    </div>
  );
};

export default AdminDashboard;