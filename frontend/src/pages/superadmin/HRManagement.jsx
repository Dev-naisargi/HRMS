import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import { UserCircle } from "lucide-react";

const HRManagement = () => {
    const [hrs, setHrs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHRs = async () => {
            try {
                const res = await api.get("/superadmin/hrs");
                setHrs(res.data);
            } catch (error) {
                console.error("Error fetching HRs", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHRs();
    }, []);

    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">HR Directory</h3>
                <p className="text-xs text-gray-500 mt-1">All registered HR accounts across tenants.</p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
                    <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-semibold border-b border-gray-200 dark:border-gray-800">
                        <tr>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Email</th>
                            <th className="px-6 py-4">Company</th>
                            <th className="px-6 py-4">Joined Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                        {loading ? (
                            <tr><td colSpan="4" className="text-center py-8">Loading...</td></tr>
                        ) : hrs.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                    <UserCircle size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                                    <p>No HR accounts found</p>
                                </td>
                            </tr>
                        ) : (
                            hrs.map((hr) => (
                                <tr key={hr._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                                    <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">{hr.name}</td>
                                    <td className="px-6 py-4">{hr.email}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50">
                                            {hr.company?.companyName || "Unknown"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs">{new Date(hr.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default HRManagement;
