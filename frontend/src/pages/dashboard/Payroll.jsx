import React, { useEffect, useState, useMemo } from 'react';
import ReusableTable from '../../components/ReusableTable';
import StatCard from '../../components/StatCard';
import Modal from '../../components/Modal';
import api from '../../utils/api';
import {
    DollarSign, CheckCircle2, Clock, Send, Check, X, User,
    AlertCircle, Download, Eye, Ban, ShieldCheck
} from 'lucide-react';

const Toast = ({ toast }) => {
    if (!toast.show) return null;
    return (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[500] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-sm transition-all duration-300 ${toast.type === 'success'
                ? 'bg-emerald-50/95 border-emerald-200 text-emerald-800 dark:bg-emerald-900/90 dark:border-emerald-800 dark:text-emerald-200'
                : 'bg-red-50/95 border-red-200 text-red-800 dark:bg-red-900/90 dark:border-red-800 dark:text-red-200'
            }`}>
            {toast.type === 'success' ? <CheckCircle2 size={18} className="shrink-0" /> : <AlertCircle size={18} className="shrink-0" />}
            <span className="text-sm font-semibold">{toast.message}</span>
        </div>
    );
};

const Payroll = () => {
    const role = (localStorage.getItem('role') || 'EMPLOYEE').toUpperCase();
    const [payrolls, setPayrolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // Modals
    const [generateModal, setGenerateModal] = useState(false);
    const [payslipModal, setPayslipModal] = useState(null);
    const [selectedPayroll, setSelectedPayroll] = useState(null);
    const [confirmAction, setConfirmAction] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    const triggerToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
    };

    /* ── Fetch payrolls ── */
    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await api.get('/payroll');
            setPayrolls(res.data.payrolls || []);
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    /* ── Approve / Reject with confirmation ── */
    const handleActionWithConfirmation = async (id, action, body = {}) => {
        setConfirmAction({ id, action, body });
    };

    const confirmAndExecuteAction = async () => {
        if (!confirmAction) return;
        
        setActionLoading(true);
        try {
            await api.put(`/payroll/${confirmAction.id}/${confirmAction.action}`, confirmAction.body);
            triggerToast(`Payroll ${confirmAction.action} successful!`);
            
            // Update the selected payroll if it's open
            if (selectedPayroll && selectedPayroll._id === confirmAction.id) {
                const updatedStatus = confirmAction.action === 'approve' ? 'APPROVED' : confirmAction.action === 'pay' ? 'PAID' : 'REJECTED';
                setSelectedPayroll({
                    ...selectedPayroll,
                    status: updatedStatus,
                });
            }

            await fetchData();
            setConfirmAction(null);
        } catch (err) {
            triggerToast(err.response?.data?.message || `Error during ${confirmAction.action}`, 'error');
        } finally {
            setActionLoading(false);
        }
    };

    /* ── Status Badge ── */
    const statusBadge = (status) => {
        let styles = 'bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-300';
        if (status === 'DRAFT') styles = 'bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-300';
        if (status === 'PENDING') styles = 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300';
        if (status === 'APPROVED') styles = 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300';
        if (status === 'PAID') styles = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300';
        if (status === 'REJECTED') styles = 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';

        return (
            <span className={`inline-flex px-2.5 py-1 rounded-lg text-[11px] font-bold ${styles}`}>
                {status || 'DRAFT'}
            </span>
        );
    };

    /* ── Stats ── */
    const stats = useMemo(() => {
        const total = payrolls.filter(p => p.status === 'PAID').reduce((sum, p) => sum + p.netPay, 0);
        const pendingCount = payrolls.filter(p => p.status === 'PENDING').length;
        const totalEmployees = new Set(payrolls.map(p => p.employeeId?._id)).size;
        return { total, pendingCount, totalEmployees };
    }, [payrolls]);

    /* ── Table Columns ── */
    const columns = [
        ...(role !== 'EMPLOYEE' ? [{
            header: 'Employee',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl flex items-center justify-center font-bold text-sm bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-300 shrink-0">
                        {row.employeeId?.name?.charAt(0).toUpperCase() || <User size={15} />}
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm leading-none">{row.employeeId?.name || 'Unknown'}</p>
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 uppercase tracking-wide">{row.employeeId?.department || '—'}</p>
                    </div>
                </div>
            )
        }] : []),
        {
            header: 'Period',
            render: (row) => <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">{row.month} {row.year}</span>
        },
        {
            header: 'Base Salary',
            render: (row) => <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">₹{row.basicSalary?.toLocaleString() || 0}</span>
        },
        {
            header: 'Deductions',
            render: (row) => <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">-₹{(row.deductions || row.totalDeductions || 0).toLocaleString()}</span>
        },
        {
            header: 'Net Pay',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-900 dark:text-gray-200 text-sm">₹{row.netPay?.toLocaleString()}</span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-semibold">Bank Transfer</span>
                </div>
            )
        },
        { header: 'Status', render: (row) => statusBadge(row.status) },
        {
            header: 'Actions',
            render: (row) => (
                <div className="flex items-center gap-1">
                    <button onClick={() => setSelectedPayroll(row)} className="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all" title="View Details">
                        <Eye size={15} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <Toast toast={toast} />

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Payroll Management</h1>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">Operational compensation and cycle auditing</p>
                </div>
                {(role === 'HR' || role === 'ADMIN') && (
                    <button
                        onClick={() => setGenerateModal(true)}
                        className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-emerald-100 dark:shadow-none transition-all"
                    >
                        <DollarSign size={16} /> Generate Payroll
                    </button>
                )}
            </div>

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard title="Total Disbursement" value={`₹${stats.total.toLocaleString()}`} icon={DollarSign}
                    colorClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" />
                <StatCard title="Pending Approvals" value={stats.pendingCount} icon={Clock}
                    colorClass="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" />
                <StatCard title="Active Headcount" value={stats.totalEmployees} icon={User}
                    colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" />
            </div>

            {/* ── Table ── */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/30">
                    <h2 className="font-bold text-gray-800 dark:text-gray-200 text-sm tracking-wide flex items-center gap-2">
                        <ShieldCheck size={16} className="text-emerald-500" /> Payroll Ledger
                    </h2>
                </div>
                <div className="[&_table]:w-full [&_table]:text-left [&_thead_th]:px-6 [&_thead_th]:py-3.5 [&_thead_th]:text-[11px] [&_thead_th]:font-bold [&_thead_th]:text-gray-400 dark:[&_thead_th]:text-gray-500 [&_thead_th]:uppercase [&_thead_th]:tracking-widest [&_thead_tr]:border-b [&_thead_tr]:border-gray-100 dark:[&_thead_tr]:border-gray-700 [&_thead_tr]:bg-gray-50/70 dark:[&_thead_tr]:bg-gray-900/50 [&_tbody_tr]:transition-colors [&_tbody_tr]:hover:bg-gray-50/60 dark:[&_tbody_tr]:hover:bg-gray-900/30 [&_tbody_td]:px-6 [&_tbody_td]:py-4 [&_tbody_tr]:border-b [&_tbody_tr]:border-gray-50 dark:[&_tbody_tr]:border-gray-700/50">
                    <ReusableTable columns={columns} data={payrolls} loading={loading} />
                </div>
                {payrolls.length > 0 && !loading && (
                    <div className="px-6 py-3 bg-gray-50/50 dark:bg-gray-900/30">
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            Showing <span className="font-semibold text-gray-600 dark:text-gray-300">{payrolls.length}</span> records
                        </p>
                    </div>
                )}
            </div>

            {/* ── Generate Modal ── */}
            {generateModal && (
                <GeneratePayrollModal
                    isOpen={generateModal}
                    onClose={() => setGenerateModal(false)}
                    onSuccess={() => { fetchData(); setGenerateModal(false); triggerToast('Payroll Cycle Generated!'); }}
                />
            )}

            {/* ── Payslip Modal ── */}
            {payslipModal && (
                <PayslipModal payroll={payslipModal} onClose={() => setPayslipModal(null)} />
            )}

            {/* ── Payroll Details Modal ── */}
            {selectedPayroll && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="sticky top-0 flex justify-between items-center px-8 py-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    Payroll Details
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {selectedPayroll.month} {selectedPayroll.year}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedPayroll(null)}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-8 space-y-6">
                            {/* Employee Info */}
                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Employee Information</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Name</p>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-1">
                                            {selectedPayroll.employeeId?.name || "—"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Department</p>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-1">
                                            {selectedPayroll.employeeId?.department || "—"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Payroll Summary */}
                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Payroll Summary</h4>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Base Salary</p>
                                        <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-1">
                                            ₹{selectedPayroll.basicSalary?.toLocaleString() || 0}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Deductions</p>
                                        <p className="text-lg font-bold text-red-600 mt-1">
                                            -₹{(selectedPayroll.deductions || selectedPayroll.totalDeductions || 0).toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Net Pay</p>
                                        <p className="text-lg font-bold text-emerald-600 mt-1">
                                            ₹{selectedPayroll.netPay?.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Status */}
                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Status</h4>
                                <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold ${
                                    selectedPayroll.status === "PAID"
                                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                                        : selectedPayroll.status === "APPROVED"
                                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                                        : selectedPayroll.status === "PENDING"
                                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                                        : selectedPayroll.status === "REJECTED"
                                        ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                                        : "bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-300"
                                }`}>
                                    <span className="w-2 h-2 rounded-full mr-2 bg-current" />
                                    {selectedPayroll.status || "DRAFT"}
                                </span>
                            </div>

                            {/* Action Buttons */}
                            {role === 'HR' && selectedPayroll.status === 'DRAFT' && (
                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => {
                                            handleActionWithConfirmation(selectedPayroll._id, 'submit');
                                        }}
                                        disabled={actionLoading}
                                        className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition disabled:opacity-50"
                                    >
                                        Submit for Approval
                                    </button>
                                </div>
                            )}

                            {role === 'ADMIN' && selectedPayroll.status === 'PENDING' && (
                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => handleActionWithConfirmation(selectedPayroll._id, 'approve')}
                                        disabled={actionLoading}
                                        className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition disabled:opacity-50"
                                    >
                                        Approve Payroll
                                    </button>
                                    <button
                                        onClick={() => handleActionWithConfirmation(selectedPayroll._id, 'reject')}
                                        disabled={actionLoading}
                                        className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition disabled:opacity-50"
                                    >
                                        Reject Payroll
                                    </button>
                                </div>
                            )}

                            {role === 'ADMIN' && selectedPayroll.status === 'APPROVED' && (
                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => handleActionWithConfirmation(selectedPayroll._id, 'pay')}
                                        disabled={actionLoading}
                                        className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition disabled:opacity-50"
                                    >
                                        Mark as Paid
                                    </button>
                                </div>
                            )}

                            {/* View Payslip Button */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => {
                                        setSelectedPayroll(null);
                                        setPayslipModal(selectedPayroll);
                                    }}
                                    className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-semibold transition"
                                >
                                    View Full Payslip
                                </button>
                            </div>
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
                                        Are you sure you want to {confirmAction.action} this payroll?
                                    </p>
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    <span className="font-semibold">Employee:</span> {selectedPayroll?.employeeId?.name}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                                    <span className="font-semibold">Period:</span> {selectedPayroll?.month} {selectedPayroll?.year}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                                    <span className="font-semibold">Net Pay:</span> ₹{selectedPayroll?.netPay?.toLocaleString()}
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
                                        confirmAction.action === "approve" || confirmAction.action === "pay"
                                            ? "bg-emerald-600 hover:bg-emerald-700"
                                            : "bg-red-600 hover:bg-red-700"
                                    }`}
                                >
                                    {actionLoading ? "Processing..." : confirmAction.action?.charAt(0).toUpperCase() + confirmAction.action?.slice(1)}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

/* ══════════════════════════════════════════════
   GENERATE PAYROLL MODAL
══════════════════════════════════════════════ */
const GeneratePayrollModal = ({ isOpen, onClose, onSuccess }) => {
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
    const [employees, setEmployees] = useState([]);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [previewing, setPreviewing] = useState(false);
    const [processing, setProcessing] = useState(false);

    // ── Mode: "all" or "single" ──
    const [mode, setMode] = useState('all');
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');

    useEffect(() => {
        if (isOpen) {
            // Reset state when modal opens
            setMonth(new Date().toISOString().slice(0, 7));
            setPreview(null);
            setMode('all');
            setSelectedEmployeeId('');
            fetchEmployees();
        }
    }, [isOpen]);

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const res = await api.get('/employees/');
            setEmployees(res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePreview = async () => {
        setPreviewing(true);
        try {
            const dateObj = new Date(month);
            const monthName = dateObj.toLocaleString('default', { month: 'long' });
            const year = dateObj.getFullYear();

            let url = `/payroll/preview?month=${monthName}&year=${year}`;
            if (mode === 'single' && selectedEmployeeId) {
                url += `&employeeId=${selectedEmployeeId}`;
            }

            const res = await api.get(url);
            setPreview(res.data);
        } catch (err) {
            alert('Preview failed: ' + (err.response?.data?.message || err.message));
        } finally {
            setPreviewing(false);
        }
    };

    const handleConfirm = async () => {
        setProcessing(true);
        try {
            const dateObj = new Date(month);
            const monthName = dateObj.toLocaleString('default', { month: 'long' });
            const year = dateObj.getFullYear();

            const payload = { month: monthName, year };
            if (mode === 'single' && selectedEmployeeId) {
                payload.employeeId = selectedEmployeeId;
            }

            await api.post('/payroll/generate', payload);
            onSuccess();
        } catch (err) {
            alert(err.response?.data?.message || 'Error generating payroll');
        } finally {
            setProcessing(false);
        }
    };

    const totals = useMemo(() => {
        if (!preview) {
            if (mode === 'single' && selectedEmployeeId) {
                return { count: 1, totalPay: 0 };
            }
            return { count: employees.length, totalPay: 0 };
        }
        return {
            count: preview.totalEmployees,
            totalPay: preview.totalPayable,
        };
    }, [preview, employees, mode, selectedEmployeeId]);

    const selectedEmployee = employees.find(e => e._id === selectedEmployeeId);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="" maxWidth="max-w-6xl">
            <div className="flex flex-col h-[85vh] overflow-hidden bg-white dark:bg-slate-900">

                {/* Modal Header */}
                <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Run Payroll Cycle</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Select Period & Audit Adjustments</p>
                    </div>
                    <div className="flex gap-3 items-center">
                        <input
                            type="month"
                            value={month}
                            onChange={(e) => { setMonth(e.target.value); setPreview(null); }}
                            className="border rounded-xl px-4 py-2 font-bold text-sm outline-none focus:ring-2 focus:ring-slate-100 dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                        />
                        <button
                            onClick={handlePreview}
                            disabled={previewing || (mode === 'single' && !selectedEmployeeId)}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 transition disabled:opacity-50"
                        >
                            {previewing ? 'Loading...' : '👁 Preview'}
                        </button>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"><X size={20} /></button>
                    </div>
                </div>

                {/* Mode Selection */}
                <div className="px-8 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 flex gap-4 items-center flex-shrink-0">
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Mode:</span>
                    <div className="flex gap-3">
                        <button
                            onClick={() => { setMode('all'); setSelectedEmployeeId(''); setPreview(null); }}
                            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                                mode === 'all'
                                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                        >
                            All Employees
                        </button>
                        <button
                            onClick={() => { setMode('single'); setPreview(null); }}
                            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                                mode === 'single'
                                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                        >
                            Single Employee
                        </button>
                    </div>
                    {mode === 'single' && (
                        <select
                            value={selectedEmployeeId}
                            onChange={(e) => { setSelectedEmployeeId(e.target.value); setPreview(null); }}
                            className="ml-auto border rounded-lg px-3 py-2 font-semibold text-sm outline-none focus:ring-2 focus:ring-slate-300 dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                        >
                            <option value="">— Select Employee —</option>
                            {employees.map(emp => (
                                <option key={emp._id} value={emp._id}>{emp.name} ({emp.department})</option>
                            ))}
                        </select>
                    )}
                </div>

                {/* Main Content - Scrollable */}
                <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
                    {/* Table - Scrollable */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-50/20 dark:bg-slate-900/50">
                        {loading ? (
                            <div className="flex items-center justify-center h-full">
                                <Clock className="animate-spin text-slate-300 dark:text-slate-600" size={32} />
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[2rem] overflow-hidden shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left whitespace-nowrap">
                                        <thead className="bg-slate-50/50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-600">
                                            <tr>
                                                {['Employee', 'Base Salary', 'HRA', 'Allowances', 'Overtime', 'PF', 'Tax', 'Leave Ded.', 'Late Ded.', 'Net Pay', 'Attendance'].map(h => (
                                                    <th key={h} className="px-4 py-4 text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                                            {preview ? preview.previews.map(emp => (
                                                <tr key={emp.employeeId} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                                                    <td className="px-4 py-4">
                                                        <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{emp.name}</p>
                                                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">{emp.department}</p>
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300 font-mono">₹{emp.basicSalary?.toLocaleString()}</td>
                                                    <td className="px-4 py-4 text-sm text-emerald-600 dark:text-emerald-400 font-mono">₹{emp.hra?.toLocaleString()}</td>
                                                    <td className="px-4 py-4 text-sm text-emerald-600 dark:text-emerald-400 font-mono">₹{emp.allowances?.toLocaleString()}</td>
                                                    <td className="px-4 py-4 text-sm text-blue-600 dark:text-blue-400 font-mono">₹{emp.overtimePay?.toLocaleString()}</td>
                                                    <td className="px-4 py-4 text-sm text-rose-500 dark:text-rose-400 font-mono">-₹{emp.pf?.toLocaleString()}</td>
                                                    <td className="px-4 py-4 text-sm text-rose-500 dark:text-rose-400 font-mono">-₹{emp.tax?.toLocaleString()}</td>
                                                    <td className="px-4 py-4 text-sm text-rose-500 dark:text-rose-400 font-mono">-₹{emp.leaveDeduction?.toLocaleString()}</td>
                                                    <td className="px-4 py-4 text-sm text-rose-500 dark:text-rose-400 font-mono">-₹{emp.lateDeduction?.toLocaleString()}</td>
                                                    <td className="px-4 py-4 font-black text-slate-900 dark:text-white">₹{emp.netPay?.toLocaleString()}</td>
                                                    <td className="px-4 py-4 text-xs text-slate-500 dark:text-slate-400">
                                                        ✅{emp.presentDays}d ❌{emp.absentDays}d ⏰{emp.lateDays}
                                                    </td>
                                                </tr>
                                            )) : (mode === 'single' && selectedEmployeeId ? [employees.find(e => e._id === selectedEmployeeId)].filter(Boolean) : employees).map(emp => (
                                                <tr key={emp._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                                                    <td className="px-4 py-4 font-bold text-slate-800 dark:text-slate-200 text-sm">{emp.name}</td>
                                                    <td className="px-4 py-4 text-sm text-slate-500 dark:text-slate-400 font-mono">₹{emp.salary?.toLocaleString() || 0}</td>
                                                    <td colSpan={9} className="px-4 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 italic uppercase tracking-wider">
                                                        Click "Preview" to see full breakdown
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar - Fixed Position */}
                    <div className="w-full md:w-80 bg-white dark:bg-slate-800 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-700 p-8 flex flex-col justify-between shrink-0 overflow-y-auto md:overflow-y-visible">
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Cycle Summary</h3>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight">Total Employees</span>
                                    <p className="text-2xl font-black text-slate-900 dark:text-white">{totals.count}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight">Total Payable</span>
                                    <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">₹{totals.totalPay?.toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 p-4 rounded-2xl space-y-1 text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">
                                <p>Basic + HRA(20%) + Allowances(10%)</p>
                                <p>+ Overtime(1.5x) + Bonus</p>
                                <p className="text-rose-500 dark:text-rose-400">- PF(12%) - Tax(10%)</p>
                                <p className="text-rose-500 dark:text-rose-400">- Leave & Late Deductions</p>
                                <p className="text-emerald-600 dark:text-emerald-400 border-t border-slate-200 dark:border-slate-600 pt-1 mt-1">= Net Pay</p>
                            </div>

                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 p-4 rounded-2xl flex gap-3">
                                <AlertCircle className="text-amber-500 dark:text-amber-400 shrink-0" size={18} />
                                <p className="text-[10px] font-bold text-amber-700 dark:text-amber-300 italic leading-relaxed uppercase tracking-tighter">
                                    Adjustments here will persist as non-editable draft records. Ensure accuracy.
                                </p>
                            </div>
                        </div>

                        <button
                            disabled={processing || (mode === 'single' && !selectedEmployeeId) || (mode === 'all' && employees.length === 0)}
                            onClick={handleConfirm}
                            className="bg-slate-900 hover:bg-slate-800 disabled:hover:bg-slate-900 dark:bg-white dark:hover:bg-slate-100 dark:disabled:hover:bg-white text-white dark:text-slate-900 w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl disabled:opacity-50 transition-all mt-6"
                        >
                            {processing ? 'Processing...' : mode === 'all' ? 'Generate Cycle' : `Generate for ${selectedEmployee?.name || 'Employee'}`}
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

/* ══════════════════════════════════════════════
   PAYSLIP MODAL
══════════════════════════════════════════════ */
const PayslipModal = ({ payroll, onClose }) => {
    const handleDownload = () => {
        const content = `
╔══════════════════════════════════════════╗
║              SALARY PAYSLIP              ║
╚══════════════════════════════════════════╝

Employee  : ${payroll.employeeId?.name || '—'}
Department: ${payroll.employeeId?.department || '—'}
Period    : ${payroll.month} ${payroll.year}
Status    : ${payroll.status}
ID        : #${payroll._id?.slice(-8)}

══════════════════════════════════════════
ATTENDANCE SUMMARY
══════════════════════════════════════════
Working Days : ${payroll.workingDays || 26}
Present Days : ${payroll.presentDays || 0}
Absent Days  : ${payroll.absentDays || 0}
Late Days    : ${payroll.lateDays || 0}
Overtime Days: ${payroll.overtimeDays || 0}
Half Days    : ${payroll.halfDays || 0}

══════════════════════════════════════════
EARNINGS
══════════════════════════════════════════
Basic Salary    : ₹${payroll.basicSalary?.toLocaleString()}
HRA (20%)       : ₹${payroll.hra?.toLocaleString() || 0}
Allowances (10%): ₹${payroll.allowances?.toLocaleString() || 0}
Bonus           : ₹${payroll.bonus?.toLocaleString()}
Overtime Pay    : ₹${payroll.overtimePay?.toLocaleString() || 0}
─────────────────────────────────────────
Gross Pay       : ₹${payroll.grossPay?.toLocaleString() || payroll.basicSalary?.toLocaleString()}

══════════════════════════════════════════
DEDUCTIONS
══════════════════════════════════════════
PF (12%)        : ₹${payroll.pf?.toLocaleString() || 0}
Tax/TDS (10%)   : ₹${payroll.tax?.toLocaleString() || 0}
Late Deduction  : ₹${payroll.lateDeduction?.toLocaleString() || 0}
Leave Deduction : ₹${payroll.leaveDeduction?.toLocaleString()}
─────────────────────────────────────────
Total Deductions: ₹${payroll.totalDeductions?.toLocaleString() || payroll.deductions?.toLocaleString()}

══════════════════════════════════════════
NET SALARY      : ₹${payroll.netPay?.toLocaleString()}
══════════════════════════════════════════
        `;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Payslip_${payroll.month}_${payroll.year}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <Modal isOpen={!!payroll} onClose={onClose} title="" maxWidth="max-w-2xl">
            <div className="p-10 space-y-6">

                {/* Header */}
                <div className="flex justify-between items-start border-b pb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-xl">
                            {payroll.employeeId?.name?.charAt(0) || 'E'}
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Salary Advice</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{payroll.month} {payroll.year}</p>
                        </div>
                    </div>
                    <div className="text-right space-y-1">
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-600 border border-emerald-200 rounded-lg text-[10px] font-black uppercase tracking-widest block">
                            {payroll.status}
                        </span>
                        <p className="text-[10px] text-slate-400 font-mono">#{payroll._id?.slice(-8)}</p>
                    </div>
                </div>

                {/* Employee Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Employee</span>
                        <p className="font-bold text-slate-800">{payroll.employeeId?.name || '—'}</p>
                        <p className="text-xs text-slate-500 uppercase">{payroll.employeeId?.department} / {payroll.employeeId?.designation}</p>
                    </div>
                </div>

                {/* Attendance Summary */}
                {payroll.presentDays !== undefined && (
                    <div className="bg-slate-50 rounded-2xl p-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Attendance Summary</p>
                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                            {[
                                { label: 'Present', value: payroll.presentDays, color: 'text-emerald-600' },
                                { label: 'Absent', value: payroll.absentDays, color: 'text-rose-500' },
                                { label: 'Late', value: payroll.lateDays, color: 'text-amber-500' },
                                { label: 'Overtime', value: payroll.overtimeDays, color: 'text-blue-500' },
                                { label: 'Half Day', value: payroll.halfDays, color: 'text-purple-500' },
                                { label: 'Working', value: payroll.workingDays, color: 'text-slate-600' },
                            ].map(({ label, value, color }) => (
                                <div key={label} className="bg-white rounded-xl p-2 border border-slate-100">
                                    <p className={`text-lg font-black ${color}`}>{value ?? 0}</p>
                                    <p className="text-slate-400 text-[10px]">{label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Financial Breakdown */}
                <div className="space-y-3">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b pb-2">Earnings</h4>
                    {[
                        { label: 'Basic Salary', value: payroll.basicSalary, color: 'text-slate-900', prefix: '' },
                        { label: 'HRA (20%)', value: payroll.hra || 0, color: 'text-emerald-600', prefix: '+' },
                        { label: 'Allowances (10%)', value: payroll.allowances || 0, color: 'text-emerald-600', prefix: '+' },
                        { label: 'Bonus', value: payroll.bonus, color: 'text-emerald-600', prefix: '+' },
                        { label: 'Overtime Pay', value: payroll.overtimePay || 0, color: 'text-blue-600', prefix: '+' },
                    ].map(({ label, value, color, prefix }) => (
                        <div key={label} className="flex justify-between items-center py-1">
                            <span className="text-slate-500 font-medium text-sm">{label}</span>
                            <span className={`font-bold text-sm ${color}`}>{prefix}₹{value?.toLocaleString() || 0}</span>
                        </div>
                    ))}
                    <div className="flex justify-between items-center py-2 border-t border-slate-100">
                        <span className="font-bold text-slate-700 text-sm">Gross Pay</span>
                        <span className="font-black text-emerald-600">₹{(payroll.grossPay || payroll.basicSalary)?.toLocaleString()}</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b pb-2">Deductions</h4>
                    {[
                        { label: 'PF (12%)', value: payroll.pf || 0 },
                        { label: 'Tax / TDS (10%)', value: payroll.tax || 0 },
                        { label: `Late Deduction (${payroll.lateDays || 0} days × ₹100)`, value: payroll.lateDeduction || 0 },
                        { label: `Leave Deduction (${payroll.absentDays || payroll.leaveDays || 0} days)`, value: payroll.leaveDeduction },
                    ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between items-center py-1">
                            <span className="text-slate-500 font-medium text-sm">{label}</span>
                            <span className="font-bold text-rose-600 text-sm">-₹{value?.toLocaleString() || 0}</span>
                        </div>
                    ))}
                    <div className="flex justify-between items-center py-2 border-t border-slate-100">
                        <span className="font-bold text-slate-700 text-sm">Total Deductions</span>
                        <span className="font-black text-rose-600">-₹{(payroll.totalDeductions || payroll.deductions)?.toLocaleString()}</span>
                    </div>
                </div>

                {/* Net Pay */}
                <div className="bg-slate-900 p-6 rounded-[2rem] flex justify-between items-center shadow-2xl shadow-slate-200">
                    <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Net Payable</span>
                        <p className="text-3xl font-black text-white italic">₹{payroll.netPay?.toLocaleString()}</p>
                    </div>
                    <button onClick={handleDownload} className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all" title="Download">
                        <Download size={20} />
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default Payroll;