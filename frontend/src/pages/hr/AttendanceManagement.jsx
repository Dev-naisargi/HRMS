import React, { useState, useEffect } from "react";
import { Search, Users, CheckCircle2, XCircle, Clock } from "lucide-react";
import ThemeToggle from "../../components/ThemeToggle";
import api from "../../utils/api";

const STATUS_COLORS = {
  Present:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  Absent: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300",
  "Half Day":
    "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  Overtime: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
};

const AttendanceManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All");

  const fetchAttendance = async () => {
    try {
      const res = await api.get("/attendance/all");
      setAttendance(res.data);
    } catch (error) {
      console.error("Failed to fetch attendance");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const attendanceRes = await api.get("/attendance/all");
      setAttendance(attendanceRes.data);

      const employeeRes = await api.get("/employees");
      setEmployees(employeeRes.data.employees);
    };

    fetchData();
  }, []);

  const departments = [
    "All",
    ...new Set(employees.map((e) => e.department).filter(Boolean)),
  ];

  const filtered = attendance.filter((record) => {
    const matchName = record.employee?.name
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const matchDept =
      department === "All" || record.employee?.department === department;

    return matchName && matchDept;
  });

  const totalEmployees = filtered.length;
  const totalPresent = filtered.filter((e) => e.status === "Present").length;
  const totalAbsent = filtered.filter((e) => e.status === "Absent").length;
  const totalLate = filtered.filter((e) => e.isLate === true).length;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Attendance Management
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Monitor employee attendance records
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Users size={20} />}
          color="blue"
          label="Total Records"
          value={totalEmployees}
        />

        <StatCard
          icon={<CheckCircle2 size={20} />}
          color="emerald"
          label="Present"
          value={totalPresent}
        />

        <StatCard
          icon={<XCircle size={20} />}
          color="red"
          label="Absent"
          value={totalAbsent}
        />

        <StatCard
          icon={<Clock size={20} />}
          color="amber"
          label="Late"
          value={totalLate}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"
          />
          <input
            type="text"
            placeholder="Search employee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-800 dark:text-white outline-none"
          />
        </div>

        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-700 dark:text-white outline-none"
        >
          {departments.map((dept, i) => (
            <option key={i}>{dept}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
            <tr>
              <th className="px-6 py-3 text-xs uppercase text-gray-400">
                Employee
              </th>
              <th className="px-6 py-3 text-xs uppercase text-gray-400">
                Department
              </th>
              <th className="px-6 py-3 text-xs uppercase text-gray-400">
                Date
              </th>
              <th className="px-6 py-3 text-xs uppercase text-gray-400">
                Check In
              </th>
              <th className="px-6 py-3 text-xs uppercase text-gray-400">
                Check Out
              </th>
              <th className="px-6 py-3 text-xs uppercase text-gray-400">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((record) => (
              <tr
                key={record._id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                <td className="px-6 py-4 font-medium text-gray-700 dark:text-gray-200">
                  {record.employee?.name}
                </td>
                <td className="px-6 py-4 text-gray-500 dark:text-gray-300">
                  {record.employee?.department}
                </td>
                <td className="px-6 py-4 text-gray-500 dark:text-gray-300">
                  {new Date(record.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-gray-500 dark:text-gray-300">
                  {record.checkIn
                    ? new Date(record.checkIn).toLocaleTimeString()
                    : "-"}
                </td>
                <td className="px-6 py-4 text-gray-500 dark:text-gray-300">
                  {record.checkOut
                    ? new Date(record.checkOut).toLocaleTimeString()
                    : "-"}
                </td>

                <td className="px-6 py-4">
                  <div className="flex gap-2 flex-wrap">
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-bold ${
                        STATUS_COLORS[record.status]
                      }`}
                    >
                      {record.status}
                    </span>

                    {record.isLate && (
                      <span className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                        Late
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* Card Component */

const COLOR_MAP = {
  blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300",
  emerald:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300",
  red: "bg-red-50 text-red-600 dark:bg-red-900/40 dark:text-red-300",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300",
};

const StatCard = ({ icon, color, label, value }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
    <div
      className={`w-10 h-10 flex items-center justify-center rounded-xl ${COLOR_MAP[color]} mb-4`}
    >
      {icon}
    </div>
    <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
      {value}
    </h2>
    <p className="text-gray-400 text-sm mt-1 font-medium">{label}</p>
  </div>
);

export default AttendanceManagement;
