import React, { useState, useEffect } from "react";
import {
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from "@heroicons/react/24/outline";
import api from "../../../utils/api";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/*  LEAVE REPORT  */

const LeaveReport = () => {

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  /*  FETCH LEAVES */

  useEffect(() => {

    const fetchLeaves = async () => {
      try {

        const res = await api.get("/leave/company");

        setLeaves(res.data);

      } catch {

        console.error("Failed to fetch leave report");

      } finally {

        setLoading(false);

      }
    };

    fetchLeaves();

  }, []);

  /* STATS */

  const total = leaves.length;
  const pending = leaves.filter(l => l.status === "Pending").length;
  const approved = leaves.filter(l => l.status === "Approved").length;
  const rejected = leaves.filter(l => l.status === "Rejected").length;

  /* LOADING  */

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
/* EXPORT CSV */

const exportCSV = () => {

  const data = leaves.map((leave) => ({
    Employee: leave.employee?.name || "Unknown",
    Department: leave.employee?.department || "-",
    Type: leave.type,
    From: new Date(leave.from).toLocaleDateString(),
    To: new Date(leave.to).toLocaleDateString(),
    Status: leave.status
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Leave");

  XLSX.writeFile(workbook, "Leave_Report.csv");

};


/* EXPORT EXCEL */

const exportExcel = () => {

  const data = leaves.map((leave) => ({
    Employee: leave.employee?.name || "Unknown",
    Department: leave.employee?.department || "-",
    Type: leave.type,
    From: new Date(leave.from).toLocaleDateString(),
    To: new Date(leave.to).toLocaleDateString(),
    Status: leave.status
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Leave");

  XLSX.writeFile(workbook, "Leave_Report.xlsx");

};


/* EXPORT PDF */

const exportPDF = () => {

  const doc = new jsPDF();

  const date = new Date().toLocaleDateString();

  doc.setFontSize(18);
  doc.text("HRMS Leave Report", 14, 20);

  doc.setFontSize(11);
  doc.text(`Generated Date: ${date}`, 14, 28);

  doc.text(`Total Requests: ${total}`, 14, 40);
  doc.text(`Pending: ${pending}`, 14, 46);
  doc.text(`Approved: ${approved}`, 14, 52);
  doc.text(`Rejected: ${rejected}`, 14, 58);

  const tableData = leaves.map((leave) => [
    leave.employee?.name || "Unknown",
    leave.employee?.department || "-",
    leave.type,
    new Date(leave.from).toLocaleDateString(),
    new Date(leave.to).toLocaleDateString(),
    leave.status
  ]);

  autoTable(doc,{
    startY:70,
    head:[["Employee","Department","Type","From","To","Status"]],
    body:tableData,
        headStyles:{
    fillColor:[16,185,129]
  },

  alternateRowStyles:{
    fillColor:[240,240,240]
  }

  });

  doc.save("Leave_Report.pdf");

};
  return (

    <div className="space-y-10">

      {/*  SUMMARY CARDS */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        <StatCard label="Total Requests" value={total} color="emerald" />
        <StatCard label="Pending" value={pending} color="amber" />
        <StatCard label="Approved" value={approved} color="blue" />
        <StatCard label="Rejected" value={rejected} color="red" />

      </div>

      {/* ================= TABLE ================= */}

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">

        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">

  <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
    Leave Requests
  </h3>

  <div className="flex gap-2">

    <button
      onClick={exportCSV}
      className="px-3 py-1 text-xs font-semibold bg-blue-500 text-white rounded-lg hover:bg-blue-600"
    >
      CSV
    </button>

    <button
      onClick={exportExcel}
      className="px-3 py-1 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
    >
      Excel
    </button>

    <button
      onClick={exportPDF}
      className="px-3 py-1 text-xs font-semibold bg-red-500 text-white rounded-lg hover:bg-red-600"
    >
      PDF
    </button>

  </div>

</div>

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead className="bg-gray-50 dark:bg-gray-800">

              <tr>

                <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase">
                  Employee
                </th>

                <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase">
                  Department
                </th>

                <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase">
                  Leave Type
                </th>

                <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase">
                  From
                </th>

                <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase">
                  To
                </th>

                <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase">
                  Status
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">

              {leaves.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-gray-400">
                    No leave records found
                  </td>
                </tr>
              )}

              {leaves.map((leave) => (

                <tr key={leave._id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">

                  <td className="px-6 py-4 text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {leave.employee?.name || "Unknown"}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {leave.employee?.department || "—"}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {leave.type}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {new Date(leave.from).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric"
                    })}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {new Date(leave.to).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric"
                    })}
                  </td>

                  <td className="px-6 py-4">

                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                        leave.status === "Approved"
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300"
                          : leave.status === "Rejected"
                          ? "bg-red-50 text-red-600 dark:bg-red-900/40 dark:text-red-300"
                          : "bg-amber-50 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300"
                      }`}
                    >
                      {leave.status}
                    </span>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>

  );

};


const COLOR_MAP = {
  emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300",
  blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300",
  red: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300",
  amber: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300",
};

const ICON_MAP = {
  "Total Requests": DocumentTextIcon,
  "Pending": ClockIcon,
  "Approved": CheckCircleIcon,
  "Rejected": XCircleIcon,
};

const StatCard = ({ label, value, color }) => {

  const Icon = ICON_MAP[label];

  return (

    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition">

      <div className="flex items-center justify-between">

        <div>
          <p className="text-sm text-gray-400 font-medium">
            {label}
          </p>

          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {value}
          </h2>
        </div>

        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${COLOR_MAP[color]}`}
        >
          {Icon && <Icon className="w-6 h-6" />}
        </div>

      </div>

    </div>

  );
};

export default LeaveReport;