import React, { useState, useEffect } from "react";
import Sidebar from "../../components/dashboard/Sidebar";
import Navbar from "../../components/dashboard/Navbar";
import CompanyManagement from "./CompanyManagement";
import HRManagement from "./HRManagement";
import EmployeeAnalytics from "./EmployeeAnalytics";
import ActivityLogs from "./ActivityLogs";
import Settings from "./Settings";
import SystemReports from "./SystemReports";
import Subscriptions from "./Subscriptions";
import api from "../../utils/api";
import {
  Building2,
  Users,
  UserCheck,
  CreditCard,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Clock,
  Plus,
  FileText,
  AlertCircle
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";

/* ==================================
   MOCK DATA FOR CHARTS
================================== */
const growthData = [
  { name: "Jan", companies: 12, employees: 400 },
  { name: "Feb", companies: 19, employees: 600 },
  { name: "Mar", companies: 25, employees: 850 },
  { name: "Apr", companies: 32, employees: 1200 },
  { name: "May", companies: 45, employees: 1600 },
  { name: "Jun", companies: 58, employees: 2100 },
];

const planData = [
  { name: "Basic", count: 24, fill: "#10B981" },
  { name: "Pro", count: 18, fill: "#3B82F6" },
  { name: "Enterprise", count: 16, fill: "#8B5CF6" },
];

const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState({
    totalCompanies: 0,
    activeCompanies: 0,
    pendingCompanies: 0,
    totalHRs: 0,
    totalEmployees: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/superadmin/stats");
        setStats(res.data);
      } catch (error) {
        console.error("Dashboard stats error", error);
      }
    };

    // Only fetch stats when viewing the main dashboard overview
    if (activeTab === "dashboard") {
      fetchStats();
    }
  }, [activeTab]);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Navbar />

        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 scroll-smooth">
          {activeTab === "dashboard" && (
            <div className="space-y-8 animate-fade-in">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                    System Overview ✨
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    Manage health, analytics, and infrastructure scaling automatically.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm">
                    <FileText size={16} /> Export Report
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl text-sm font-medium transition-all shadow-md shadow-emerald-500/20">
                    <Plus size={16} /> New Tenant
                  </button>
                </div>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <StatWidget
                  title="Total Companies"
                  value={stats.totalCompanies}
                  trend="+12%"
                  icon={<Building2 size={20} />}
                  color="blue"
                />
                <StatWidget
                  title="Total HRs"
                  value={stats.totalHRs}
                  trend="+5%"
                  icon={<UserCheck size={20} />}
                  color="emerald"
                />
                <StatWidget
                  title="Total Employees"
                  value={stats.totalEmployees}
                  trend="+28%"
                  icon={<Users size={20} />}
                  color="purple"
                />
                <StatWidget
                  title="Active Subs"
                  value={stats.activeCompanies}
                  trend="+15%"
                  icon={<CreditCard size={20} />}
                  color="amber"
                />
                <StatWidget
                  title="Pending Approvals"
                  value={stats.pendingCompanies}
                  trend="-2%"
                  trendDown
                  icon={<Clock size={20} />}
                  color="rose"
                />
                <StatWidget
                  title="System Health"
                  value="100%"
                  trend="Stable"
                  icon={<ShieldCheck size={20} />}
                  color="indigo"
                />
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Main Graph */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mx-20 -my-20 pointer-events-none"></div>

                  <div className="flex justify-between items-center mb-6 relative z-10">
                    <div>
                      <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">Growth Analytics</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Companies & Employees onboarding rate</p>
                    </div>
                    <select className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs rounded-lg px-2 py-1 text-gray-600 dark:text-gray-300 outline-none">
                      <option>Last 6 Months</option>
                      <option>This Year</option>
                    </select>
                  </div>

                  <div className="w-full relative z-10">
                    <ResponsiveContainer width="100%" height={288}>
                      <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorCom" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorEmp" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                        <RechartsTooltip
                          contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                          itemStyle={{ color: '#E5E7EB' }}
                        />
                        <Area type="monotone" dataKey="employees" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorEmp)" />
                        <Area type="monotone" dataKey="companies" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorCom)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Secondary Modules Column */}
                <div className="space-y-6">
                  {/* Plan Distribution */}
                  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">Active Subscriptions</h3>
                    <div className="mt-4">
                      <ResponsiveContainer width="100%" height={230}>
                        <BarChart data={planData} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} fontSize={12} stroke="#9CA3AF" />
                          <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px' }} />
                          <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                            {planData.map((entry, index) => (
                              <cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Functional Tabs */}
          {activeTab === "companies" && <CompanyManagement />}
          {activeTab === "hr" && <HRManagement />}
          {activeTab === "employee" && <EmployeeAnalytics />}
          {activeTab === "activity" && <ActivityLogs />}
          {activeTab === "settings" && <Settings />}
          {activeTab === "reports" && <SystemReports />}
          {activeTab === "subscriptions" && <Subscriptions />}

        </div>
      </div>
    </div>
  );
};

/* ==================================
   REUSABLE STAT WIDGET
================================== */
const StatWidget = ({ title, value, trend, icon, color, trendDown }) => {
  const colorMap = {
    emerald: "from-emerald-500/10 to-emerald-500/5 text-emerald-600 border-emerald-500/20",
    blue: "from-blue-500/10 to-blue-500/5 text-blue-600 border-blue-500/20",
    purple: "from-purple-500/10 to-purple-500/5 text-purple-600 border-purple-500/20",
    amber: "from-amber-500/10 to-amber-500/5 text-amber-600 border-amber-500/20",
    rose: "from-rose-500/10 to-rose-500/5 text-rose-600 border-rose-500/20",
    indigo: "from-indigo-500/10 to-indigo-500/5 text-indigo-600 border-indigo-500/20",
  };

  const bgStyle = colorMap[color] || colorMap.emerald;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-2xl shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${bgStyle} rounded-bl-full opacity-60 group-hover:opacity-100 transition-opacity`}></div>

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-2 rounded-xl bg-gradient-to-br ${bgStyle} border backdrop-blur-sm`}>
            {icon}
          </div>
          <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md ${trend === 'Stable' ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            : trendDown ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
              : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
            }`}>
            {trend !== 'Stable' && (trendDown ? <TrendingDown size={12} /> : <TrendingUp size={12} />)}
            {trend}
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{value}</h3>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">{title}</p>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;