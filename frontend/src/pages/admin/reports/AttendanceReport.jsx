import React, { useEffect, useState } from "react";
import {
  UsersIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from "@heroicons/react/24/outline";
import api from "../../../utils/api";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const AttendanceReport = () => {
  const [records, setRecords] = useState([]);

  const fetchAttendance = async () => {
    try {
      const res = await api.get("/attendance/all");
      setRecords(res.data);
    } catch {
      console.error("Failed to fetch attendance");
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAttendance();
    }, 0);
    return () => clearTimeout(timer);
  }, []);
  /* EXPORT CSV */

const exportCSV = () => {

  const data = records.map((record) => ({
    Employee: record.employee?.name,
    Department: record.employee?.department || "-",
    Date: new Date(record.date).toLocaleDateString(),
    Status: record.status
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

  XLSX.writeFile(workbook, "Attendance_Report.csv");
};


/* EXPORT EXCEL */

const exportExcel = () => {

  const data = records.map((record) => ({
    Employee: record.employee?.name,
    Department: record.employee?.department || "-",
    Date: new Date(record.date).toLocaleDateString(),
    Status: record.status
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

  XLSX.writeFile(workbook, "Attendance_Report.xlsx");
};


/* EXPORT PDF */

const exportPDF = () => {

  const doc = new jsPDF();

  const date = new Date().toLocaleDateString();

  doc.setFontSize(18);
  doc.text("HRMS Attendance Report", 14, 20);

  doc.setFontSize(11);
  doc.text(`Generated Date: ${date}`, 14, 28);

  doc.text(`Total Records: ${total}`, 14, 40);
  doc.text(`Present: ${present}`, 14, 46);
  doc.text(`Absent: ${absent}`, 14, 52);
  doc.text(`Late: ${late}`, 14, 58);

  const tableData = records.map((record) => [
    record.employee?.name,
    record.employee?.department || "-",
    new Date(record.date).toLocaleDateString(),
    record.status
  ]);

  autoTable(doc,{
    startY: 70,
    head:[["Employee","Department","Date","Status"]],
    body:tableData,
     headStyles:{
    fillColor:[16,185,129]
  },

  alternateRowStyles:{
    fillColor:[240,240,240]
  }

  });

  doc.save("Attendance_Report.pdf");
};

  const total = records.length;
  const present = records.filter(r => r.status === "Present").length;
  const absent = records.filter(r => r.status === "Absent").length;
  const late = records.filter(r => r.status === "Late").length;

  return (
    <div className="space-y-10">

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Records" value={total} color="emerald" />
        <StatCard label="Present" value={present} color="emerald" />
        <StatCard label="Absent" value={absent} color="red" />
        <StatCard label="Late" value={late} color="amber" />
      </div>

      {/* TABLE */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">

      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">

  <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
    Attendance Records
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

            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase">
                  Employee
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase">
                  Department
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {records.map((record) => (
                <tr key={record._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">

                  <td className="px-6 py-4 text-sm font-semibold text-gray-800 dark:text-gray-100">
                    {record.employee?.name}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {record.employee?.department || "—"}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {new Date(record.date).toLocaleDateString()}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                        record.status === "Present"
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300"
                          : record.status === "Absent"
                          ? "bg-red-50 text-red-600 dark:bg-red-900/40 dark:text-red-300"
                          : "bg-amber-50 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300"
                      }`}
                    >
                      {record.status}
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

/* CARD */

const COLOR_MAP = {
  emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300",
  red: "bg-red-50 text-red-600 dark:bg-red-900/40 dark:text-red-300",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300",
};

const ICON_MAP = {
  "Total Records": UsersIcon,
  "Present": CheckCircleIcon,
  "Absent": XCircleIcon,
  "Late": ClockIcon,
};

const StatCard = ({ label, value, color }) => {

  const Icon = ICON_MAP[label];

  return (
<div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 p-6 rounded-2xl shadow-sm hover:shadow-md transition">
      <div className="flex items-center justify-between">

        <div>
          <p className="text-sm font-medium text-gray-400">
            {label}
          </p>

          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
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

export default AttendanceReport;