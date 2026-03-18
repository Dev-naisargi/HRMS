
import React, { useState, useEffect } from "react";
import { Search, FileText, CheckCircle2, XCircle, Clock } from "lucide-react";
import api from "../../utils/api";

const STATUS_COLORS = {
  Pending:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  Approved:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  Rejected:
    "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300",
};

const LeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All");
  const [loading, setLoading] = useState(true);

  /*FETCH LEAVES */

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const res = await api.get("/leave/company");
        console.log(res.data);

        const formatted = res.data.map((leave) => ({
          id: leave._id,
          name: leave.employee?.name || "Unknown",
          department: leave.employee?.department || "—",
          type: leave.type,
          from: leave.from,
          to: leave.to,
          status: leave.status,
        }));

        setLeaves(formatted);
      } catch (err) {
        console.error("Failed to load leaves");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaves();
  }, []);

  /*  FILTERING  */

  const departments = ["All", ...new Set(leaves.map((l) => l.department))];

  const filtered = leaves.filter((leave) => {
    const matchName = leave.name
      .toLowerCase()
      .includes(search.toLowerCase());

   const matchDept =
  department === "All" || leave.department === department;

    return matchName && matchDept;
  });

  /*  STATS  */

  const totalRequests = filtered.length;
  const totalPending = filtered.filter((l) => l.status === "Pending").length;
  const totalApproved = filtered.filter((l) => l.status === "Approved").length;
  const totalRejected = filtered.filter((l) => l.status === "Rejected").length;

  /*  UPDATE STATUS */

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/leave/status/${id}`, { status });

      setLeaves((prev) =>
        prev.map((leave) =>
          leave.id === id ? { ...leave, status } : leave
        )
      );
    } catch (error) {
      console.error("Status update failed");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Leave Management
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Approve or reject employee leave requests
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        <StatCard
          icon={<FileText size={20} />}
          color="blue"
          label="Total Requests"
          value={totalRequests}
        />

        <StatCard
          icon={<Clock size={20} />}
          color="amber"
          label="Pending"
          value={totalPending}
        />

        <StatCard
          icon={<CheckCircle2 size={20} />}
          color="emerald"
          label="Approved"
          value={totalApproved}
        />

        <StatCard
          icon={<XCircle size={20} />}
          color="red"
          label="Rejected"
          value={totalRejected}
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
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-800 dark:text-white focus:border-emerald-400 outline-none"
          />
        </div>

        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-800 dark:text-white focus:border-emerald-400 outline-none"
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
                Type
              </th>

              <th className="px-6 py-3 text-xs uppercase text-gray-400">
                From
              </th>

              <th className="px-6 py-3 text-xs uppercase text-gray-400">
                To
              </th>

              <th className="px-6 py-3 text-xs uppercase text-gray-400">
                Status
              </th>

              <th className="px-6 py-3 text-xs uppercase text-gray-400 text-right">
                Action
              </th>
            </tr>

          </thead>

          <tbody className="divide-y divide-gray-50 dark:divide-gray-700">

            {filtered.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-10 text-gray-400">
                  No leave requests found
                </td>
              </tr>
            )}

            {filtered.map((leave) => (

              <tr
                key={leave.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >

                <td className="px-6 py-4 font-medium text-gray-700 dark:text-gray-200">
                  {leave.name}
                </td>

                <td className="px-6 py-4 text-gray-500 dark:text-gray-300">
                 {leave.department}
                </td>

                <td className="px-6 py-4 text-gray-500 dark:text-gray-300">
                  {leave.type}
                </td>

                <td className="px-6 py-4 text-gray-500 dark:text-gray-300">
                  {new Date(leave.from).toLocaleDateString()}
                </td>

                <td className="px-6 py-4 text-gray-500 dark:text-gray-300">
                  {new Date(leave.to).toLocaleDateString()}
                </td>

                <td className="px-6 py-4">

                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-bold ${STATUS_COLORS[leave.status]}`}
                  >
                    {leave.status}
                  </span>

                </td>

                <td className="px-6 py-4 text-right space-x-2">

                  {leave.status === "Pending" && (
                    <>
                      <button
                        onClick={() =>
                          updateStatus(leave.id, "Approved")
                        }
                        className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs hover:bg-emerald-700"
                      >
                        Approve
                      </button>

                      <button
                        onClick={() =>
                          updateStatus(leave.id, "Rejected")
                        }
                        className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs hover:bg-red-600"
                      >
                        Reject
                      </button>
                    </>
                  )}

                </td>

              </tr>
            ))}
          </tbody>
        </table>

      </div>

    </div>
  );
};

/*  STAT CARD  */

const COLOR_MAP = {
  blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300",
  emerald:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300",
  red: "bg-red-50 text-red-600 dark:bg-red-900/40 dark:text-red-300",
  amber:
    "bg-amber-50 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300",
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

export default LeaveManagement;

