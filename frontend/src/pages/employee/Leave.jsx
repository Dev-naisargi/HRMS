import React, { useState, useEffect } from "react";
import { X, CalendarDays, Trash2 } from "lucide-react";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import api from "../../utils/api";
import ThemeToggle from "../../components/ThemeToggle";

const Leave = () => {
  const [leaves, setLeaves] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    type: "Sick",
    from: "",
    to: "",
    reason: "",
  });

 useEffect(() => {
  const fetchLeaves = async () => {
    try {
      const res = await api.get("/leave/my");
      setLeaves(res.data);
    } catch (err) {
      console.error("Failed to load leaves");
    }
  };

  fetchLeaves();
}, []);
 const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const res = await api.post("/leave/apply", form);

    setLeaves((prev) => [res.data.leave, ...prev]);

    setForm({
      type: "Sick",
      from: "",
      to: "",
      reason: "",
    });

    setShowModal(false);

  } catch (err) {
    console.error("Leave apply failed");
  }
};

  const handleDelete = async (id) => {
  try {
    await api.delete(`/leave/${id}`);

    setLeaves((prev) => prev.filter((leave) => leave._id !== id));
  } catch (err) {
    console.error("Delete failed");
  }
};

  const pending = leaves.filter((l) => l.status === "Pending").length;
  const approved = leaves.filter((l) => l.status === "Approved").length;
  const rejected = leaves.filter((l) => l.status === "Rejected").length;

  const totalUsed = leaves.length;

 const casualUsed = leaves.filter((l) => l.type === "Casual").length;
const sickUsed = leaves.filter((l) => l.type === "Sick").length;
const annualUsed = leaves.filter((l) => l.type === "Paid").length;

  return (
    <div className="space-y-10">

      {/* HEADER */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Leave Management
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Submit and track your leave applications
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition"
        >
          Apply Leave
        </button>
      </div>

      {/* SUMMARY CARDS */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <StatCard title="Pending Requests" count={pending} type="pending" />
        <StatCard title="Approved Leaves" count={approved} type="approved" />
        <StatCard title="Rejected Leaves" count={rejected} type="rejected" />

      </div>

      {/* LEAVE USAGE */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        <UsageCard title="Total Used" count={totalUsed} />
        <UsageCard title="Casual Leave" count={casualUsed} />
        <UsageCard title="Sick Leave" count={sickUsed} />
        <UsageCard title="Annual Leave" count={annualUsed} />

      </div>

      {/* TABLE */}

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">

        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
            Leave History
          </h3>

          <span className="text-sm text-gray-400">
            {leaves.length} records
          </span>
        </div>

        {leaves.length === 0 ? (
          <div className="py-24 flex flex-col items-center text-center">
            <CalendarDays size={40} className="text-gray-300 dark:text-gray-600" />
            <h4 className="mt-4 text-gray-700 dark:text-gray-200 font-medium">
              No Leave Requests Yet
            </h4>
            <p className="text-sm text-gray-400 mt-1">
              Start by applying for your first leave.
            </p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-800 text-xs uppercase text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">From</th>
                <th className="px-6 py-4">To</th>
                <th className="px-6 py-4">Applied On</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {leaves.map((leave, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">

                  <td className="px-6 py-4 text-sm font-medium text-gray-800 dark:text-gray-200">
                    {leave.type}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                   {new Date(leave.from).toLocaleDateString("en-IN")}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {new Date(leave.to).toLocaleDateString("en-IN")}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                   {new Date(leave.createdAt).toLocaleDateString()}
                  </td>

                  <td className="px-6 py-4">

                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        leave.status === "Approved"
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300"
                          : leave.status === "Rejected"
                          ? "bg-red-50 text-red-600 dark:bg-red-900/40 dark:text-red-300"
                          : "bg-amber-50 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300"
                      }`}
                    >

                      <span className="w-1.5 h-1.5 rounded-full mr-2 bg-current"></span>
                      {leave.status}

                    </span>

                  </td>

                  <td className="px-6 py-4">

                    {leave.status === "Pending" ? (
                      <button
                        onClick={() => handleDelete(leave._id)}
                        className="text-red-500 hover:text-red-700 transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    ) : (
                      <span className="text-gray-300 dark:text-gray-600">—</span>
                    )}

                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        )}

      </div>

      {/* MODAL */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">

          <div className="bg-white dark:bg-gray-900 w-full max-w-xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">

            {/* HEADER */}

            <div className="flex justify-between items-center px-8 py-6 border-b border-gray-100 dark:border-gray-700">

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Apply Leave
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Submit your leave request
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={18} />
              </button>

            </div>

            {/* FORM */}

            <form onSubmit={handleSubmit} className="p-8 space-y-6">

              <div>

                <label className="text-xs font-semibold text-gray-500  uppercase tracking-wide">
                  Leave Type
                </label>

                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm({ ...form, type: e.target.value })
                  }
                 className="w-full mt-2 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                <option value="Sick">Sick</option>
<option value="Casual">Casual</option>
<option value="Paid">Paid</option>
                </select>

              </div>

              <div className="grid grid-cols-2 gap-4">

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    From Date
                  </label>

                  <input
                    type="date"
                    required
                    value={form.from}
                    onChange={(e) =>
                      setForm({ ...form, from: e.target.value })
                    }
                   className="w-full mt-2 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500" />
                </div>

                <div>

                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    To Date
                  </label>

                  <input
                    type="date"
                    required
                    value={form.to}
                    onChange={(e) =>
                      setForm({ ...form, to: e.target.value })
                    }
                    className="w-full mt-2 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 resize-none" />
                </div>

              </div>

              <div>

                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Reason
                </label>

                <textarea
                  required
                  rows={4}
                  value={form.reason}
                  onChange={(e) =>
                    setForm({ ...form, reason: e.target.value })
                  }
                  className="w-full mt-2 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 resize-none"/>

              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition"
              >
                Submit Application
              </button>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* STAT CARD */

const StatCard = ({ title, count, type }) => {

  const colorMap = {
    approved:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300",
    rejected:
      "bg-red-50 text-red-600 dark:bg-red-900/40 dark:text-red-300",
    pending:
      "bg-amber-50 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300",
  };

  const iconMap = {
    "Approved Leaves": <CheckCircle size={20} />,
    "Rejected Leaves": <XCircle size={20} />,
    "Pending Requests": <Clock size={20} />,
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">

      {/* ICON */}
      <div
        className={`w-10 h-10 flex items-center justify-center rounded-xl mb-4 ${colorMap[type]}`}
      >
        {iconMap[title]}
      </div>

      {/* COUNT */}
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
        {count}
      </h2>

      {/* LABEL */}
      <p className="text-gray-400 text-sm mt-1 font-medium">
        {title}
      </p>

    </div>
  );
};

/* USAGE CARD */

const UsageCard = ({ title, count }) => {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-2xl font-semibold mt-2 text-gray-900 dark:text-gray-100">
        {count}
      </p>
    </div>
  );
};

export default Leave;