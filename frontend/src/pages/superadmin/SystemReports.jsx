import React, { useState, useEffect } from "react";
import { FileText, Download, Trash2, Eye, Filter, Loader2, FileSpreadsheet } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../utils/api";

const SystemReports = () => {
    const [generating, setGenerating] = useState(false);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const res = await api.get("/superadmin/reports");
            setReports(res.data);
        } catch {
            toast.error("Failed to load reports");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            const res = await api.post("/superadmin/reports/generate", {
                name: `System Summary Report - ${new Date().toLocaleDateString()}`,
                companyTarget: "All Companies",
                type: "System"
            });
            toast.success("Report generated successfully");
            setReports([res.data.report, ...reports]);
        } catch {
            toast.error("Failed to generate report");
        } finally {
            setGenerating(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this report?")) return;
        try {
            await api.delete(`/superadmin/reports/${id}`);
            toast.success("Report deleted");
            setReports(reports.filter(r => r._id !== id));
        } catch {
            toast.error("Failed to delete report");
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    const exportToCSV = () => {
        if (reports.length === 0) {
            toast.error("No reports to export");
            return;
        }

        const headers = ["Report Name", "Company Target", "Type", "Generated Date", "Status"];
        const rows = reports.map(r => [
            r.name,
            r.companyTarget,
            r.type,
            formatDate(r.createdAt),
            r.status
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `reports_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Reports exported to CSV");
    };

    const exportToExcel = () => {
        if (reports.length === 0) {
            toast.error("No reports to export");
            return;
        }

        // Create a simple Excel-compatible format using HTML table
        const headers = ["Report Name", "Company Target", "Type", "Generated Date", "Status"];
        
        let htmlContent = `
            <table border="1">
                <thead>
                    <tr style="background-color: #10B981; color: white; font-weight: bold;">
                        ${headers.map(h => `<td>${h}</td>`).join("")}
                    </tr>
                </thead>
                <tbody>
                    ${reports.map((r, idx) => `
                        <tr style="background-color: ${idx % 2 === 0 ? '#f3f4f6' : 'white'};">
                            <td>${r.name}</td>
                            <td>${r.companyTarget}</td>
                            <td>${r.type}</td>
                            <td>${formatDate(r.createdAt)}</td>
                            <td>${r.status}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        `;

        const blob = new Blob([htmlContent], { type: "application/vnd.ms-excel;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `reports_${new Date().toISOString().slice(0, 10)}.xls`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Reports exported to Excel");
    };

    const downloadReport = (report) => {
        if (report.status !== 'Completed') {
            toast.error("Only completed reports can be downloaded");
            return;
        }
        
        // Export individual report to CSV
        const reportData = [report];
        const headers = ["Report Name", "Company Target", "Type", "Generated Date", "Status"];
        const rows = reportData.map(r => [
            r.name,
            r.companyTarget,
            r.type,
            formatDate(r.createdAt),
            r.status
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${report.name.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Report downloaded");
    };

    const totalReports = reports.length;
    const thisMonthReports = reports.filter(r => new Date(r.createdAt).getMonth() === new Date().getMonth()).length;
    const failedReports = reports.filter(r => r.status === "Failed").length;

    return (
        <div className="space-y-6 animate-fade-in max-w-7xl">

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-2xl shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl"><FileText size={24} /></div>
                    <div><h4 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalReports}</h4><p className="text-xs text-gray-500 uppercase font-medium mt-1">Total Reports Generated</p></div>
                </div>
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-2xl shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl"><FileText size={24} /></div>
                    <div><h4 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{thisMonthReports}</h4><p className="text-xs text-gray-500 uppercase font-medium mt-1">This Month Reports</p></div>
                </div>
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-2xl shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-xl"><FileText size={24} /></div>
                    <div><h4 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{failedReports}</h4><p className="text-xs text-gray-500 uppercase font-medium mt-1">Failed Reports</p></div>
                </div>
            </div>

            {/* Filter Section */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                    <div className="flex items-center gap-2 text-gray-500 font-medium text-sm">
                        <Filter size={16} /> Filters:
                    </div>
                    <input type="date" className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-emerald-500/40" />
                    <select className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-emerald-500/40">
                        <option>All Companies</option>
                        <option>TechFlow Inc</option>
                        <option>Apex Corp</option>
                    </select>
                    <select className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-emerald-500/40">
                        <option>All Types</option>
                        <option>Attendance</option>
                        <option>Payroll</option>
                        <option>HR</option>
                        <option>Employees</option>
                        <option>System</option>
                    </select>
                </div>
                <button onClick={handleGenerate} disabled={generating} className="w-full md:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-70">
                    {generating ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                    {generating ? "Generating..." : "Generate Report"}
                </button>
            </div>

            {/* Reports Table */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">Generated Reports Ledger</h3>
                    <div className="flex gap-2">
                        <button onClick={exportToCSV} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 transition-colors">
                            <Download size={14} /> CSV
                        </button>
                        <button onClick={exportToExcel} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 transition-colors">
                            <FileSpreadsheet size={14} /> Excel
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
                        <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-semibold border-b border-gray-200 dark:border-gray-800">
                            <tr>
                                <th className="px-6 py-4">Report Name</th>
                                <th className="px-6 py-4">Company Target</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Generated Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        <Loader2 size={24} className="animate-spin mx-auto text-emerald-500" />
                                    </td>
                                </tr>
                            ) : reports.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">No reports found matching your criteria.</td>
                                </tr>
                            ) : (
                                reports.map((report) => (
                                    <tr key={report._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-gray-800 dark:text-gray-200 flex flex-col">
                                            <span>{report.name}</span>
                                            <span className="text-[10px] font-normal text-gray-400">ID: {report._id.substring(0, 8)}...</span>
                                        </td>
                                        <td className="px-6 py-4">{report.companyTarget}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-md">
                                                {report.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs">{formatDate(report.createdAt)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${report.status === "Completed" ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50" :
                                                report.status === "Failed" ? "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50" :
                                                    "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50"
                                                }`}>
                                                {report.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors border border-transparent hover:border-blue-200 dark:hover:border-blue-800" title="View Report Details">
                                                    <Eye size={16} />
                                                </button>
                                                <button onClick={() => downloadReport(report)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800" disabled={report.status !== 'Completed'} title="Download as CSV">
                                                    <Download size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(report._id)} className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors border border-transparent hover:border-rose-200 dark:hover:border-rose-800" title="Delete Report">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SystemReports;
