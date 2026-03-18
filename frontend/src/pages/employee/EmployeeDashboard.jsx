import React, { useState, useEffect } from "react";
import Sidebar from "../../components/dashboard/Sidebar";
import Navbar from "../../components/dashboard/Navbar";
import Attendance from "./Attendance";
import Leave from "./Leave";
import MyPayroll from "./MyPayroll";
import api from "../../utils/api";
import { CheckCircle, XCircle, Clock, FileText } from "lucide-react";

const EmployeeDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [user, setUser] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);

  /*  FETCH DATA  */

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await api.get("/auth/me");
        setUser(userRes.data.user);

        const attendanceRes = await api.get("/attendance/my");
        setAttendance(attendanceRes.data);

        const leaveRes = await api.get("/leave/my");
        setLeaves(leaveRes.data);

      } catch (err) {
        console.error("Data fetch failed");
      }
    };

    fetchData();
  }, []);

  /*  ATTENDANCE STATS  */

  const totalDays = attendance.length;

  const present = attendance.filter(
    (a) => a.status === "Present"
  ).length;

  const late = attendance.filter(
    (a) => a.status === "Late"
  ).length;

  /*  LEAVE STATS  */

  const approvedLeaves = leaves.filter(
    (l) => l.status === "Approved"
  ).length;

  const pendingLeaves = leaves.filter(
    (l) => l.status === "Pending"
  ).length;

  const rejectedLeaves = leaves.filter(
    (l) => l.status === "Rejected"
  ).length;

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="p-8 max-w-7xl mx-auto w-full">

          {/* DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="space-y-10">

              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Welcome back, {user?.name?.split(" ")[0]} 👋
                  </h1>
                  <p className="text-gray-400 text-sm mt-1">
                    Here’s a quick overview of your work activity.
                  </p>
                </div>

                <div className="text-sm text-gray-400">
                  {new Date().toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

                <StatCard
                  icon={<Clock size={20} />}
                  color="blue"
                  label="Working Days"
                  value={totalDays}
                />

                <StatCard
                  icon={<CheckCircle size={20} />}
                  color="emerald"
                  label="Present Days"
                  value={present}
                />

                <StatCard
                  icon={<FileText size={20} />}
                  color="purple"
                  label="Approved Leaves"
                  value={approvedLeaves}
                />

                <StatCard
                  icon={<Clock size={20} />}
                  color="amber"
                  label="Pending Leaves"
                  value={pendingLeaves}
                />

              </div>

              {/* Main Content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Recent Attendance */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Recent Attendance
                    </h3>
                  </div>

                  <div className="p-6 space-y-4">
                    {attendance.slice(0, 5).map((record, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center"
                      >
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {new Date(record.date).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>

                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                            record.status === "Present"
                              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300"
                              : record.status === "Late"
                              ? "bg-amber-50 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300"
                              : "bg-red-50 text-red-600 dark:bg-red-900/40 dark:text-red-300"
                          }`}
                        >
                          {record.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Leave Summary */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-6">
                    Leave Summary
                  </h3>

                  <div className="space-y-5">

                    <ProgressItem
                      label="Approved"
                      value={approvedLeaves}
                      color="emerald"
                    />

                    <ProgressItem
                      label="Pending"
                      value={pendingLeaves}
                      color="amber"
                    />

                    <ProgressItem
                      label="Rejected"
                      value={rejectedLeaves}
                      color="red"
                    />

                  </div>
                </div>

              </div>
            </div>
          )}

          {activeTab === "attendance" && <Attendance />}
          {activeTab === "leaves" && <Leave />}
          {activeTab === "payroll" && <MyPayroll />}
        </main>
      </div>
    </div>
  );
};

/* CARD */

const StatCard = ({ icon, color, label, value }) => {

  const colorMap = {
    emerald:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300",
    red:
      "bg-red-50 text-red-600 dark:bg-red-900/40 dark:text-red-300",
    amber:
      "bg-amber-50 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300",
    blue:
      "bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300",
    purple:
      "bg-purple-50 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300",
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">

      <div
        className={`w-10 h-10 flex items-center justify-center rounded-xl mb-4 ${colorMap[color]}`}
      >
        {icon}
      </div>

      <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
        {value}
      </h2>

      <p className="text-gray-400 text-sm mt-1 font-medium">
        {label}
      </p>

    </div>
  );
};

/* PROGRESS BAR */

const ProgressItem = ({ label, value, color }) => {

  const colorMap = {
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    red: "bg-red-500",
  };

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600 dark:text-gray-300">
          {label}
        </span>
        <span className="font-semibold text-gray-800 dark:text-white">
          {value}
        </span>
      </div>

      <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full">
        <div
          className={`${colorMap[color]} h-2 rounded-full`}
          style={{ width: `${value * 20}%` }}
        />
      </div>
    </div>
  );
};

export default EmployeeDashboard;