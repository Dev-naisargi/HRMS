import React, { useState } from "react";

import { BarChart3 } from "lucide-react";

import EmployeeReport from "./EmployeeReport";
import AttendanceReport from "./AttendanceReport";
import LeaveReport from "./LeaveReport";

const Reports = () => {
  const [activeTab, setActiveTab] = useState("employee");

  return (
    <div className="space-y-10">

      {/* HEADER  */}
      <div className="flex items-center justify-between">

        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Reports & Analytics
          </h2>

          <p className="text-sm text-gray-400 dark:text-gray-400 mt-1">
            Monitor employees, attendance, and leave performance
          </p>
        </div>

        <div className="flex items-center gap-4">

          {/* Admin Tag */}
          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 px-4 py-2 rounded-xl text-sm font-semibold">
            <BarChart3 size={16} />
            Admin Reports
          </div>

        

        </div>

      </div>

      {/*  SUB NAVIGATION  */}
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm p-2 flex gap-2 w-fit">

        <Tab
          label="Employee Report"
          id="employee"
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <Tab
          label="Attendance Report"
          id="attendance"
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <Tab
          label="Leave Report"
          id="leave"
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

      </div>

      {/*  CONTENT */}
      <div>
        {activeTab === "employee" && <EmployeeReport />}
        {activeTab === "attendance" && <AttendanceReport />}
        {activeTab === "leave" && <LeaveReport />}
      </div>

    </div>
  );
};

/*  TAB COMPONENT  */

const Tab = ({ label, id, activeTab, setActiveTab }) => {
  const isActive = activeTab === id;

  return (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
        isActive
          ? "bg-emerald-600 text-white shadow-sm"
          : "text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
      }`}
    >
      {label}
    </button>
  );
};

export default Reports;