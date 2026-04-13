import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import { 
    Building2, CheckCircle, XCircle, Search, Filter, 
    MoreVertical, Eye, Edit3, Trash2, ShieldAlert, 
    Download, ChevronLeft, ChevronRight, X
} from "lucide-react";
import toast from "react-hot-toast";

const CompanyManagement = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [activeActionId, setActiveActionId] = useState(null);

    const fetchCompanies = async () => {
        try {
            setLoading(true);
            const res = await api.get("/superadmin/companies", {
                params: {
                    page,
                    search: searchTerm,
                    status: statusFilter === "ALL" ? "" : statusFilter
                }
            });
            setCompanies(res.data.companies);
            setTotalPages(res.data.totalPages);
        } catch {
            toast.error("Failed to load companies");
        } finally {
            setLoading(false);
        }
    };

   useEffect(() => {
    fetchCompanies();
}, [page, statusFilter, searchTerm]);
    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchCompanies();
    };

    const handleApprove = async (id) => {
        try {
            await api.patch(`/superadmin/company/${id}/approve`);
            toast.success("Company Approved");
            fetchCompanies();
        } catch {
            toast.error("Error approving company");
        }
    };

    const handleReject = async () => {
        if (!rejectReason) return toast.error("Please provide a reason");
        try {
            await api.patch(`/superadmin/company/${activeActionId}/reject`, { reason: rejectReason });
            toast.success("Company Rejected");
            setIsRejectModalOpen(false);
            setRejectReason("");
            fetchCompanies();
        } catch {
            toast.error("Error rejecting company");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure? This will delete the company and ALL its users!")) return;
        try {
            await api.delete(`/superadmin/company/${id}`);
            toast.success("Company Deleted");
            fetchCompanies();
        } catch {
            toast.error("Error deleting company");
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === "SUSPENDED" ? "APPROVED" : "SUSPENDED";
        try {
            await api.patch(`/superadmin/company/${id}/status`, { status: newStatus });
            toast.success(`Company ${newStatus === "SUSPENDED" ? "Suspended" : "Activated"}`);
            fetchCompanies();
        } catch {
            toast.error("Error updating status");
        }
    };

    const exportCSV = () => {
        const headers = ["Name", "Domain", "Status", "Admin Email", "Created At"];
        const rows = companies.map(c => [
            c.name, c.domain, c.status, c.adminEmail, new Date(c.createdAt).toLocaleDateString()
        ]);
        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n" 
            + rows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `companies_export_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
    };

    const getStatusColor = (status) => {
        switch(status) {
            case "APPROVED": return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50";
            case "PENDING": return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50";
            case "REJECTED": return "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800/50";
            case "SUSPENDED": return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <div className="space-y-6">
            {/* Header & Stats Placeholder would go here */}
            
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
                {/* Filters & Actions Bar */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between">
                    <form onSubmit={handleSearch} className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name, domain, email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm transition-all"
                        />
                    </form>

                    <div className="flex flex-wrap items-center gap-3">
                        <select 
                            value={statusFilter} 
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium outline-none"
                        >
                            <option value="ALL">All Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                            <option value="SUSPENDED">Suspended</option>
                        </select>

                        <button 
                            onClick={exportCSV}
                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 transition-colors"
                        >
                            <Download size={14} /> Export
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="text-xs uppercase bg-gray-50/50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-bold border-b border-gray-100 dark:border-gray-800">
                            <tr>
                                <th className="px-6 py-4">Company</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Created</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="4" className="px-6 py-4 h-16 bg-gray-50/20"></td>
                                    </tr>
                                ))
                            ) : companies.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-20 text-center text-gray-500">
                                        <Building2 size={48} className="mx-auto mb-4 opacity-20" />
                                        <p className="text-lg font-medium">No companies found</p>
                                    </td>
                                </tr>
                            ) : (
                                companies.map((company) => (
                                    <tr key={company._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold shadow-sm">
                                                    {company.name?.charAt(0) || 'C'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-gray-100">{company.name || company.companyName || 'Unknown Company'}</p>
                                                    <p className="text-xs text-gray-400">{company.domain}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 text-[10px] font-bold rounded-full border ${getStatusColor(company.status)}`}>
                                                {company.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500">
                                            {new Date(company.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="relative inline-block text-left">
                                                <button 
                                                    onClick={() => setActiveActionId(activeActionId === company._id ? null : company._id)}
                                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                                >
                                                    <MoreVertical size={16} />
                                                </button>
                                                
                                                {activeActionId === company._id && (
                                                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                                        <button 
                                                            onClick={() => { setSelectedCompany(company); setIsDetailsModalOpen(true); setActiveActionId(null); }}
                                                            className="flex items-center gap-2 w-full px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                                        >
                                                            <Eye size={14} /> View Details
                                                        </button>
                                                        
                                                        {company.status === "PENDING" ? (
                                                            <>
                                                                <button 
                                                                    onClick={() => handleApprove(company._id)}
                                                                    className="flex items-center gap-2 w-full px-4 py-2 text-xs font-medium text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                                                                >
                                                                    <CheckCircle size={14} /> Approve
                                                                </button>
                                                                <button 
                                                                    onClick={() => { setActiveActionId(company._id); setIsRejectModalOpen(true); }}
                                                                    className="flex items-center gap-2 w-full px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                                                                >
                                                                    <XCircle size={14} /> Reject
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button 
                                                                    onClick={() => toggleStatus(company._id, company.status)}
                                                                    className={`flex items-center gap-2 w-full px-4 py-2 text-xs font-medium transition-colors ${company.status === "SUSPENDED" ? "text-emerald-600 hover:bg-emerald-50" : "text-amber-600 hover:bg-amber-50"}`}
                                                                >
                                                                    <ShieldAlert size={14} /> {company.status === "SUSPENDED" ? "Activate" : "Suspend"}
                                                                </button>
                                                            </>
                                                        )}
                                                        
                                                        <div className="h-px bg-gray-100 dark:bg-gray-800 my-1" />
                                                        
                                                        <button 
                                                            onClick={() => handleDelete(company._id)}
                                                            className="flex items-center gap-2 w-full px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                                                        >
                                                            <Trash2 size={14} /> Delete Company
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <p className="text-xs text-gray-500">Page {page} of {totalPages}</p>
                    <div className="flex gap-2">
                        <button 
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                            className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-all"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button 
                            disabled={page === totalPages}
                            onClick={() => setPage(page + 1)}
                            className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-all"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Reject Reason Modal */}
            {isRejectModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                        <div className="p-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Reject Company Registration</h3>
                            <p className="text-xs text-gray-500 mb-6">Provide a reason for rejection. This will be visible to the company admin.</p>
                            
                            <textarea 
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Enter reason for rejection..."
                                className="w-full h-32 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-rose-500/30 transition-all resize-none"
                            />
                        </div>
                        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 flex gap-3">
                            <button 
                                onClick={() => setIsRejectModalOpen(false)}
                                className="flex-1 py-2.5 text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleReject}
                                className="flex-1 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-lg shadow-rose-500/20 transition-all"
                            >
                                Confirm Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Details Modal (Full SaaS Style) */}
            {isDetailsModalOpen && selectedCompany && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white font-black text-xl">
                                    {selectedCompany.name?.charAt(0) || 'C'}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight">{selectedCompany.name || 'Unknown'}</h3>
                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">{selectedCompany.domain}</p>
                                </div>
                            </div>
                            <button onClick={() => setIsDetailsModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-400 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-8">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${getStatusColor(selectedCompany.status)}`}>
                                        {selectedCompany.status}
                                    </span>
                                </div>
                                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Created At</p>
                                    <p className="text-sm font-black text-gray-900 dark:text-white">{new Date(selectedCompany.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Company Info</h4>
                                    <div className="space-y-3">
                                        <InfoItem label="Industry" value={selectedCompany.industry || "Not Specified"} />
                                        <InfoItem label="Contact Email" value={selectedCompany.email || selectedCompany.adminEmail} />
                                        <InfoItem label="Phone" value={selectedCompany.phone || "N/A"} />
                                        <InfoItem label="Address" value={selectedCompany.address || "N/A"} />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Admin Details</h4>
                                    <div className="space-y-3">
                                        <InfoItem label="Admin Email" value={selectedCompany.adminEmail} />
                                        <InfoItem label="Approval Date" value={selectedCompany.status === "APPROVED" ? "Verified" : "Pending"} />
                                    </div>
                                </div>
                            </div>

                            {selectedCompany.status === "REJECTED" && (
                                <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/50 rounded-2xl">
                                    <p className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest mb-2">Rejection Reason</p>
                                    <p className="text-sm text-rose-800 dark:text-rose-300 font-medium italic">"{selectedCompany.rejectionReason}"</p>
                                </div>
                            )}
                        </div>

                        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                            <button 
                                onClick={() => setIsDetailsModalOpen(false)}
                                className="px-6 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold transition-all shadow-sm"
                            >
                                Close Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const InfoItem = ({ label, value }) => (
    <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
        <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{value}</p>
    </div>
);

export default CompanyManagement;
