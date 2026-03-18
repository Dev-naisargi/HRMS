import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import { Building2, CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";

const CompanyManagement = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCompanies = async () => {
        try {
            setLoading(true);
            const res = await api.get("/superadmin/companies");
            setCompanies(res.data);
        } catch (error) {
            toast.error("Failed to load companies");
        } finally {
            setLoading(false);
        }
    };

    const approveCompany = async (id) => {
        try {
            await api.put(`/superadmin/approve/${id}`);
            toast.success("Company Approved");
            fetchCompanies();
        } catch (err) {
            toast.error("Error approving");
        }
    };

    const rejectCompany = async (id) => {
        try {
            await api.put(`/superadmin/reject/${id}`);
            toast.success("Company Rejected");
            fetchCompanies();
        } catch (err) {
            toast.error("Error rejecting");
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, []);

    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                <div>
                    <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">Company Grid</h3>
                    <p className="text-xs text-gray-500 mt-1">Manage tenant approvals and status.</p>
                </div>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Search company..."
                        className="px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/30 text-gray-700 dark:text-gray-200"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
                    <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-semibold border-b border-gray-200 dark:border-gray-800">
                        <tr>
                            <th className="px-6 py-4">Company Details</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Contact</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                        {loading ? (
                            <tr><td colSpan="4" className="text-center py-8">Loading...</td></tr>
                        ) : companies.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                    <div className="flex flex-col items-center justify-center">
                                        <Building2 size={32} className="text-gray-300 dark:text-gray-600 mb-3" />
                                        <p>No companies found</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            companies.map((company) => (
                                <tr key={company._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 font-bold border border-emerald-200 dark:border-emerald-800/50">
                                                {company.companyName.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-800 dark:text-gray-200">
                                                    {company.companyName}
                                                </p>
                                                <p className="text-xs text-gray-500">{company.companyAddress}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${company.status === "Approved"
                                            ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50"
                                            : company.status === "Rejected"
                                                ? "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50"
                                                : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50"
                                            }`}>
                                            {company.status || "Pending"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-xs">
                                        {company.companyPhone}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        {company.status === "Pending" ? (
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => approveCompany(company._id)}
                                                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800"
                                                    title="Approve"
                                                >
                                                    <CheckCircle size={18} />
                                                </button>
                                                <button
                                                    onClick={() => rejectCompany(company._id)}
                                                    className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors border border-transparent hover:border-rose-200 dark:hover:border-rose-800"
                                                    title="Reject"
                                                >
                                                    <XCircle size={18} />
                                                </button>
                                            </div>
                                        ) : (
                                            <button className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">
                                                Manage Details
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CompanyManagement;
