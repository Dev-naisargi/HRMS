import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import { Users } from "lucide-react";

const EmployeeAnalytics = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const res = await api.get("/superadmin/employees");
                setEmployees(res.data);
            } catch (error) {
                console.error("Error fetching employees", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEmployees();
    }, []);

    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">Global Employee Roster</h3>
                <p className="text-xs text-gray-500 mt-1">Cross-tenant employee visibility.</p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
                    <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-semibold border-b border-gray-200 dark:border-gray-800">
                        <tr>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Department</th>
                            <th className="px-6 py-4">Company</th>
                            <th className="px-6 py-4">Joined Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                        {loading ? (
                            <tr><td colSpan="4" className="text-center py-8">Loading...</td></tr>
                        ) : employees.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                    <Users size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                                    <p>No employees found</p>
                                </td>
                            </tr>
                        ) : (
                            employees.map((emp) => (
                                <tr key={emp._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                                    <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">{emp.name}</td>
                                    <td className="px-6 py-4">{emp.department || "N/A"}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50">
                                            {emp.company?.companyName || "Unknown"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs">{new Date(emp.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EmployeeAnalytics;
