import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import toast from "react-hot-toast";
import {
  X,
  CalendarDays,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Check,
  Eye,
  AlertCircle,
} from "lucide-react";
const role = localStorage.getItem("role");
/* ── Stat Card ─────────────────────────────── */
const MiniStat = ({ title, count, colorClass, icon: Icon }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200">
    <div
      className={`w-10 h-10 flex items-center justify-center rounded-xl mb-4 ${colorClass}`}
    >
      <Icon size={20} />
    </div>
    <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
      {count}
    </h2>
    <p className="text-gray-400 text-sm mt-1 font-medium">{title}</p>
  </div>
);
/* ── Usage Card ─────────────────────────────── */
const UsageCard = ({ title, count }) => (
  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
    <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
    <p className="text-2xl font-semibold mt-2 text-gray-900 dark:text-gray-100">
      {count}
    </p>
  </div>
);

/* ═══════════════════════════════════════════════════
   LEAVE MANAGEMENT — role-adaptive
═══════════════════════════════════════════════════ */
const LeaveManagement = () => {
  const role = localStorage.getItem("role")?.toUpperCase() || "EMPLOYEE";
  const currentUserId = localStorage.getItem("userId") || localStorage.getItem("id");
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    type: "Sick",
    from: "",
    to: "",
    reason: "",
  });
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isApplyingLeave, setIsApplyingLeave] = useState(false);
  const [filters, setFilters] = useState({
    status: "ALL",
    startDate: "",
    endDate: "",
    query: "",
  });

  const normalize = (s) => (s || "").toUpperCase();

  // For employees, show only their own leaves; for HR/Admin, show all
  const employeeFilteredLeaves = role === "EMPLOYEE" 
    ? leaves.filter((leave) => leave.employeeId?._id === currentUserId)
    : leaves;

  const filteredLeaves = employeeFilteredLeaves.filter((leave) => {
    const normalizedStatus = normalize(leave.status);
    if (filters.status !== "ALL" && normalizedStatus !== filters.status) return false;

    if (filters.startDate && new Date(leave.startDate) < new Date(filters.startDate))
      return false;
    if (filters.endDate && new Date(leave.endDate) > new Date(filters.endDate))
      return false;

    const q = filters.query.trim().toLowerCase();
    if (q) {
      const nameMatch = leave.employeeId?.name?.toLowerCase().includes(q);
      const typeMatch = leave.type?.toLowerCase().includes(q);
      if (!nameMatch && !typeMatch) return false;
    }

    return true;
  });

  /* ── Fetch ── */
  const fetchLeaves = async () => {
    try {
      const res = await api.get("/leave");
      setLeaves(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load leaves", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [role]);

  /* ── Apply Leave (Employee) ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      setIsApplyingLeave(true);
      await api.post("/leave/apply", {
        startDate: form.from,
        endDate: form.to,
        type: form.type.toUpperCase(),
        reason: form.reason,
      });
      toast.success("Leave Applied Successfully");
      setForm({ type: "Sick", from: "", to: "", reason: "" });
      setShowModal(false);
      await fetchLeaves();
    } catch (err) {
      toast.error(err.response?.data?.message || "Leave application failed");
    } finally {
      setSubmitting(false);
      setIsApplyingLeave(false);
    }
  };

  /* ── Approve / Reject with confirmation ── */
  const handleActionWithConfirmation = async (id, status) => {
    setConfirmAction({ id, status });
  };

  const confirmAndExecuteAction = async () => {
    if (!confirmAction) return;
    
    setActionLoading(true);
    try {
      const currentRole = localStorage.getItem("role");
      const endpoint =
        currentRole === "HR"
          ? `/leave/approve/hr/${confirmAction.id}`
          : `/leave/approve/admin/${confirmAction.id}`;

      await api.patch(endpoint, { status: confirmAction.status });

      toast.success(
        confirmAction.status === "APPROVED" 
          ? "Leave approved successfully" 
          : "Leave rejected successfully"
      );

      // Optimistic UI update for rows and modal
      setLeaves((prev) =>
        prev.map((l) =>
          l._id === confirmAction.id
            ? {
                ...l,
                status: confirmAction.status,
                hrApproval: currentRole === "HR" ? confirmAction.status : l.hrApproval,
                adminApproval: currentRole === "ADMIN" ? confirmAction.status : l.adminApproval,
              }
            : l
        )
      );

      if (selectedLeave && selectedLeave._id === confirmAction.id) {
        setSelectedLeave((prev) => ({
          ...prev,
          status: confirmAction.status,
          hrApproval: currentRole === "HR" ? confirmAction.status : prev.hrApproval,
          adminApproval: currentRole === "ADMIN" ? confirmAction.status : prev.adminApproval,
        }));
      }

      // Close modals and update UI
      setConfirmAction(null);
      setSelectedLeave(null);
      setShowModal(false);
    } catch (err) {
      console.error(err);
      toast.error("Action failed");
    } finally {
      setActionLoading(false);
    }
  };
  const handleDelete = (id) => {
    setDeleteConfirm(id);
  };

  const confirmAndDelete = async () => {
    if (!deleteConfirm) return;
    
    setActionLoading(true);
    try {
      await api.delete(`/leave/${deleteConfirm}`);
      toast.success("Leave deleted successfully");
      setDeleteConfirm(null);
      setSelectedLeave(null);
      await fetchLeaves();
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    } finally {
      setActionLoading(false);
    }
  };
  /* ── Stats ── */
  const statsData = employeeFilteredLeaves;
  const pending = statsData.filter(
    (l) => normalize(l.status) === "PENDING",
  ).length;
  const approved = statsData.filter(
    (l) => normalize(l.status) === "APPROVED",
  ).length;
  const rejected = statsData.filter(
    (l) => normalize(l.status) === "REJECTED",
  ).length;

  // Employee usage breakdown

  // ✅ only approved leaves count as used
  const approvedLeaves = statsData.filter(
    (l) => normalize(l.status) === "APPROVED",
  );

  const totalUsed = approvedLeaves.length;

  const casualUsed = approvedLeaves.filter(
    (l) => normalize(l.type) === "CASUAL",
  ).length;

  const sickUsed = approvedLeaves.filter(
    (l) => normalize(l.type) === "SICK",
  ).length;

  const annualUsed = approvedLeaves.filter(
    (l) => normalize(l.type) === "PAID",
  ).length;
  const statusBadgeCls = (status) => {
    const s = status?.toUpperCase();

    if (s === "APPROVED")
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300";

    if (s === "REJECTED")
      return "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300";

    return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300";
  };

  const renderFilterControls = () => (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm mb-5">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
          >
            <option value="ALL">All</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">From Date</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">To Date</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Search</label>
          <input
            type="text"
            placeholder="Employee name or leave type"
            value={filters.query}
            onChange={(e) => setFilters({ ...filters, query: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
          />
        </div>
      </div>
      <div className="mt-3 text-right">
        <button
          onClick={() => setFilters({ status: "ALL", startDate: "", endDate: "", query: "" })}
          className="px-4 py-2 text-xs font-semibold uppercase rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );

  /* ══════════════════════════════
       EMPLOYEE VIEW
    ══════════════════════════════ */
  if (role === "EMPLOYEE") {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Leave Management
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Submit and track your leave applications
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition active:scale-95 shadow-sm"
          >
            Apply Leave
          </button>
        </div>

        {/* Status stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <MiniStat
            title="Pending Requests"
            count={pending}
            colorClass="bg-amber-50 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300"
            icon={Clock}
          />
          <MiniStat
            title="Approved Leaves"
            count={approved}
            colorClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300"
            icon={CheckCircle}
          />
          <MiniStat
            title="Rejected Leaves"
            count={rejected}
            colorClass="bg-red-50 text-red-600 dark:bg-red-900/40 dark:text-red-300"
            icon={XCircle}
          />
        </div>

        {/* Usage cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          <UsageCard title="Total Used" count={totalUsed} />
          <UsageCard title="Casual Leave" count={casualUsed} />
          <UsageCard title="Sick Leave" count={sickUsed} />
          <UsageCard title="Annual Leave" count={annualUsed} />
        </div>

        {/* Leave history table */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
              Leave History
            </h3>
            <span className="text-sm text-gray-400">
              {filteredLeaves.length} records
            </span>
          </div>

          {filteredLeaves.length === 0 ? (
            <div className="py-24 flex flex-col items-center text-center">
              <CalendarDays
                size={40}
                className="text-gray-300 dark:text-gray-600"
              />
              <h4 className="mt-4 text-gray-700 dark:text-gray-200 font-medium">
                No Leave Requests Yet
              </h4>
              <p className="text-sm text-gray-400 mt-1">
                Start by applying for your first leave.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-800 text-xs uppercase text-gray-500 dark:text-gray-400">
                  <tr>
                    {[
                      "Type",
                      "From",
                      "To",
                      "Days",
                      "HR Appr",
                      "Admin Appr",
                      "Status",
                      "Action",
                    ].map((h) => (
                      <th key={h} className="px-6 py-4">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {filteredLeaves.map((leave) => (
                    <tr
                      key={leave._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                        <td className="px-6 py-4 text-sm font-medium text-gray-800 dark:text-gray-200">
                        {leave.type}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(leave.startDate).toLocaleDateString("en-IN")}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(leave.endDate).toLocaleDateString("en-IN")}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {leave.duration}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusBadgeCls(leave.hrApproval)}`}
                        >
                          {leave.hrApproval}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusBadgeCls(leave.adminApproval)}`}
                        >
                          {leave.adminApproval}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusBadgeCls(leave.status)}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full mr-2 bg-current" />
                          {leave.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {role === "EMPLOYEE" &&
                            leave.status === "PENDING" && (
                              <button
                                onClick={() => handleDelete(leave._id)}
                                title="Delete"
                                className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                            <button
                                onClick={() => setSelectedLeave(leave)}
                                title="View Details"
                                className="p-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                              >
                                <Eye size={16} />
                              </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Apply Leave Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-900 w-full max-w-xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800">
              <div className="flex justify-between items-center px-8 py-6 border-b border-gray-200 dark:border-gray-700">
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
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">
                    Leave Type
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Sick">Sick</option>
                    <option value="Casual">Casual</option>
                    <option value="Paid">Paid (Annual)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">
                      From Date
                    </label>
                    <input
                      type="date"
                      required
                      value={form.from}
                      onChange={(e) =>
                        setForm({ ...form, from: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">
                      To Date
                    </label>
                    <input
                      type="date"
                      required
                      value={form.to}
                      min={form.from}
                      onChange={(e) => setForm({ ...form, to: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">
                    Reason
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={form.reason}
                    onChange={(e) =>
                      setForm({ ...form, reason: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition disabled:opacity-60"
                >
                  {submitting ? "Submitting..." : "Submit Application"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ══════════════════════════════
       HR / ADMIN VIEW
    ══════════════════════════════ */
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Leave Management
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Review and approve employee leave requests.
        </p>
      </div>

      {renderFilterControls()}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <MiniStat
          title="Pending Requests"
          count={pending}
          colorClass="bg-amber-50 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300"
          icon={Clock}
        />
        <MiniStat
          title="Approved"
          count={approved}
          colorClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300"
          icon={CheckCircle}
        />
        <MiniStat
          title="Rejected"
          count={rejected}
          colorClass="bg-red-50 text-red-600 dark:bg-red-900/40 dark:text-red-300"
          icon={XCircle}
        />
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
            All Leave Requests
          </h3>
          <span className="text-sm text-gray-400">{filteredLeaves.length} records</span>
        </div>
        {filteredLeaves.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p>No leave requests found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-800 text-xs uppercase text-gray-500 dark:text-gray-400">
                <tr>
                  {[
                    "Type",
                    "From",
                    "To",
                    "Days",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th key={h} className="px-6 py-4">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredLeaves.map((leave) => (
                  <tr
                    key={leave._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-800 dark:text-gray-200">
                      {leave.type}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(leave.startDate).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(leave.endDate).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {leave.duration}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusBadgeCls(leave.status)}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full mr-2 bg-current" />
                        {leave.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedLeave(leave)}
                        title="View Details"
                        className="p-1.5 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg transition-colors"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Leave Details Modal */}
        {selectedLeave && !confirmAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 flex justify-between items-center px-8 py-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Leave Request Details
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Review and manage leave application
                  </p>
                </div>
                <button
                  onClick={() => setSelectedLeave(null)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-8 space-y-6">
  

                {/* Leave Details */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Leave Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Employee Name</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-1">{selectedLeave.employeeId?.name || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</p>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusBadgeCls(selectedLeave.status)}`}>
                        {selectedLeave.status || "Pending"}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Leave Type</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-1">
                        {selectedLeave.type || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Number of Days</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-1">
                        {selectedLeave.duration || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">From Date</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-1">
                        {new Date(selectedLeave.startDate).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">To Date</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-1">
                        {new Date(selectedLeave.endDate).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Reason */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Reason for Leave</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {selectedLeave.reason || "No reason provided"}
                  </p>
                </div>

                {/* Approval Status */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Approval Status</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Overall Status</p>
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                        selectedLeave.status?.toUpperCase() === "APPROVED"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                          : selectedLeave.status?.toUpperCase() === "REJECTED"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                      }`}>
                        <span className="w-2 h-2 rounded-full mr-2 bg-current" />
                        {selectedLeave.status || "Pending"}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">HR Approval</p>
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                        selectedLeave.hrApproval?.toUpperCase() === "APPROVED"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                          : selectedLeave.hrApproval?.toUpperCase() === "REJECTED"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                      }`}>
                        <span className="w-2 h-2 rounded-full mr-2 bg-current" />
                        {selectedLeave.hrApproval || "Pending"}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Admin Approval</p>
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                        selectedLeave.adminApproval?.toUpperCase() === "APPROVED"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                          : selectedLeave.adminApproval?.toUpperCase() === "REJECTED"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                      }`}>
                        <span className="w-2 h-2 rounded-full mr-2 bg-current" />
                        {selectedLeave.adminApproval || "Pending"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {role === "EMPLOYEE" && selectedLeave.status?.toUpperCase() === "PENDING" && (
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => {
                        handleDelete(selectedLeave._id);
                        setSelectedLeave(null);
                      }}
                      className="flex-1 px-4 py-3 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl font-semibold transition"
                    >
                      Delete Request
                    </button>
                  </div>
                )}

                {role === "HR" && selectedLeave.hrApproval?.toUpperCase() === "PENDING" && (
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => handleActionWithConfirmation(selectedLeave._id, "APPROVED")}
                      disabled={actionLoading}
                      className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition disabled:opacity-50"
                    >
                      Approve Leave
                    </button>
                    <button
                      onClick={() => handleActionWithConfirmation(selectedLeave._id, "REJECTED")}
                      disabled={actionLoading}
                      className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition disabled:opacity-50"
                    >
                      Reject Leave
                    </button>
                  </div>
                )}

                {role === "ADMIN" && selectedLeave.hrApproval?.toUpperCase() === "APPROVED" && selectedLeave.adminApproval?.toUpperCase() === "PENDING" && (
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => handleActionWithConfirmation(selectedLeave._id, "APPROVED")}
                      disabled={actionLoading}
                      className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition disabled:opacity-50"
                    >
                      Approve Leave
                    </button>
                    <button
                      onClick={() => handleActionWithConfirmation(selectedLeave._id, "REJECTED")}
                      disabled={actionLoading}
                      className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition disabled:opacity-50"
                    >
                      Reject Leave
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {confirmAction && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800">
              <div className="p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                    <AlertCircle className="text-amber-600 dark:text-amber-400" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Confirm Action
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Are you sure you want to {confirmAction.status?.toLowerCase()} this leave request?
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-semibold">Leave Type:</span> {selectedLeave?.type}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                    <span className="font-semibold">Duration:</span> {selectedLeave?.duration} days
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setConfirmAction(null)}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-semibold transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmAndExecuteAction}
                    disabled={actionLoading}
                    className={`flex-1 px-4 py-3 text-white rounded-xl font-semibold transition disabled:opacity-50 ${
                      confirmAction.status === "APPROVED"
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    {actionLoading ? "Processing..." : confirmAction.status === "APPROVED" ? "Approve" : "Reject"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800">
              <div className="p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                    <AlertCircle className="text-red-600 dark:text-red-400" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Delete Leave Request
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      This action cannot be undone. Are you sure you want to delete this leave request?
                    </p>
                  </div>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-700 dark:text-red-300 font-semibold">
                    ⚠️ Warning: Permanent deletion
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-semibold transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmAndDelete}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition disabled:opacity-50"
                  >
                    {actionLoading ? "Deleting..." : "Delete Permanently"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveManagement;
