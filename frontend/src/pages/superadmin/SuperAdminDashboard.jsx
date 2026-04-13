import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import SuperSidebar from "../../components/SuperSidebar";
import Navbar from "../../components/dashboard/Navbar";
import StatCard from "../../components/StatCard";
import CompanyManagement from "./CompanyManagement";
import HRManagement from "./HRManagement";
import SystemReports from "./SystemReports";
import api from "../../utils/api";
import {
  Building2,
  Users,
  UserCheck,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Clock
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from "recharts";

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState({
    totalCompanies: 0,
    activeCompanies: 0,
    pendingCompanies: 0,
    totalHRs: 0,
    totalEmployees: 0,
    growthData: [],
    planData: [],
  });

  const location = useLocation();
  const activeTab = useMemo(() => {
    const path = location.pathname || "";
    if (path.includes("/companies")) return "companies";
    if (path.includes("/hr")) return "hr";
    if (path.includes("/reports")) return "reports";
    return "dashboard";
  }, [location.pathname]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/superadmin/stats");
        setStats(res.data);
      } catch (error) {
        console.error("Dashboard stats error", error);
      }
    };

    if (activeTab === "dashboard") {
      fetchStats();
    }
  }, [activeTab]);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <SuperSidebar />

      <div className="flex-1 flex flex-col ml-64 h-screen overflow-hidden">
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

                
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                <StatCard
                  title="Total Companies"
                  value={stats.totalCompanies}
                  icon={Building2}
                  colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                />
                <StatCard
                  title="Total HRs"
                  value={stats.totalHRs}
                  icon={UserCheck}
                  colorClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                />
                <StatCard
                  title="Total Employees"
                  value={stats.totalEmployees}
                  icon={Users}
                  colorClass="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                />
                <StatCard
                  title="Pending Companies"
                  value={stats.pendingCompanies}
                  icon={Clock}
                  colorClass="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                />
                <StatCard
                  title="System Health"
                  value="100%"
                  icon={ShieldCheck}
                  colorClass="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
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

                  <div className="w-full h-72 relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.growthData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
              </div>
            </div>
          )}

          {/* Functional Tabs */}
          {activeTab === "companies" && <CompanyManagement />}
          {activeTab === "hr" && <HRManagement />}
          {activeTab === "reports" && <SystemReports />}

        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;