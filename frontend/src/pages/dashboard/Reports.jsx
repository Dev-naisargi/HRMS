import React, { useEffect, useState } from 'react';
import ReusableTable from '../../components/ReusableTable';
import api from '../../utils/api';
import { Download, FileText, File } from 'lucide-react';
import toast from 'react-hot-toast';
import {
    BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, Tooltip, CartesianGrid,
    ResponsiveContainer, Legend
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const TABS = ['Employees', 'Attendance', 'Leave'];
const COLORS = ['#10b981', '#ef4444', '#f59e0b'];

const Reports = () => {
    const [activeTab, setActiveTab] = useState('Employees');
    const [employees, setEmployees] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const [empRes, attRes, leaveRes] = await Promise.all([
                    api.get('/employees/'),                   // { employees: [...] }
                    api.get('/attendance/all'),               // raw array with populated employee
                    api.get('/leave'),                // raw array with populated employee
                ]);
                setEmployees(empRes.data || []);
                setAttendance(Array.isArray(attRes.data) ? attRes.data : []);
                setLeaves(Array.isArray(leaveRes.data) ? leaveRes.data : []);
            } catch (err) {
                console.error('Reports fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    // Export functions
    const exportToCSV = (data, filename) => {
        if (!data || data.length === 0) {
            toast.error("No data to export");
            return;
        }

        let csvContent = "";

        if (activeTab === 'Employees') {
            csvContent = "Name,Email,Department,Position,Joined Date\n";
            data.forEach(emp => {
                csvContent += `"${emp.name}","${emp.email}","${emp.department || 'N/A'}","${emp.designation || 'N/A'}","${emp.doj ? new Date(emp.doj).toLocaleDateString() : 'N/A'}"\n`;
            });
        } else if (activeTab === 'Attendance') {
            csvContent = "Employee,Department,Date,Check In,Check Out,Hours,Status\n";
            data.forEach(att => {
                csvContent += `"${att.employee?.name || 'N/A'}","${att.employee?.department || 'N/A'}","${att.date ? new Date(att.date).toLocaleDateString() : 'N/A'}","${att.checkIn ? new Date(att.checkIn).toLocaleTimeString() : 'N/A'}","${att.checkOut ? new Date(att.checkOut).toLocaleTimeString() : 'N/A'}","${att.workingHours || 'N/A'}","${att.status || 'N/A'}"\n`;
            });
        } else if (activeTab === 'Leave') {
            csvContent = "Employee,Department,Type,From,To,Days,Status\n";
            data.forEach(leave => {
                csvContent += `"${leave.employeeId?.name || 'N/A'}","${leave.employeeId?.department || 'N/A'}","${leave.type || 'N/A'}","${leave.startDate ? new Date(leave.startDate).toLocaleDateString() : 'N/A'}","${leave.endDate ? new Date(leave.endDate).toLocaleDateString() : 'N/A'}","${leave.duration || 'N/A'}","${leave.status || 'N/A'}"\n`;
            });
        }

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`${filename} exported to CSV`);
    };

    const exportToExcel = (data, filename) => {
        if (!data || data.length === 0) {
            toast.error("No data to export");
            return;
        }

        let htmlContent = "";

        if (activeTab === 'Employees') {
            htmlContent = `
                <table border="1" style="border-collapse: collapse; width: 100%;">
                    <thead style="background-color: #10B981; color: white;">
                        <tr><td>Name</td><td>Email</td><td>Department</td><td>Position</td><td>Joined Date</td></tr>
                    </thead>
                    <tbody>
                        ${data.map((emp, idx) => `
                            <tr style="background-color: ${idx % 2 === 0 ? '#f3f4f6' : 'white'};">
                                <td>${emp.name}</td>
                                <td>${emp.email}</td>
                                <td>${emp.department || 'N/A'}</td>
                                <td>${emp.designation || 'N/A'}</td>
                                <td>${emp.doj ? new Date(emp.doj).toLocaleDateString() : 'N/A'}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            `;
        } else if (activeTab === 'Attendance') {
            htmlContent = `
                <table border="1" style="border-collapse: collapse; width: 100%;">
                    <thead style="background-color: #10B981; color: white;">
                        <tr><td>Employee</td><td>Department</td><td>Date</td><td>Check In</td><td>Check Out</td><td>Hours</td><td>Status</td></tr>
                    </thead>
                    <tbody>
                        ${data.map((att, idx) => `
                            <tr style="background-color: ${idx % 2 === 0 ? '#f3f4f6' : 'white'};">
                                <td>${att.employee?.name || 'N/A'}</td>
                                <td>${att.employee?.department || 'N/A'}</td>
                                <td>${att.date ? new Date(att.date).toLocaleDateString() : 'N/A'}</td>
                                <td>${att.checkIn ? new Date(att.checkIn).toLocaleTimeString() : 'N/A'}</td>
                                <td>${att.checkOut ? new Date(att.checkOut).toLocaleTimeString() : 'N/A'}</td>
                                <td>${att.workingHours || 'N/A'}</td>
                                <td>${att.status || 'N/A'}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            `;
        } else if (activeTab === 'Leave') {
            htmlContent = `
                <table border="1" style="border-collapse: collapse; width: 100%;">
                    <thead style="background-color: #10B981; color: white;">
                        <tr><td>Employee</td><td>Department</td><td>Type</td><td>From</td><td>To</td><td>Days</td><td>Status</td></tr>
                    </thead>
                    <tbody>
                        ${data.map((leave, idx) => `
                            <tr style="background-color: ${idx % 2 === 0 ? '#f3f4f6' : 'white'};">
                                <td>${leave.employeeId?.name || 'N/A'}</td>
                                <td>${leave.employeeId?.department || 'N/A'}</td>
                                <td>${leave.type || 'N/A'}</td>
                                <td>${leave.startDate ? new Date(leave.startDate).toLocaleDateString() : 'N/A'}</td>
                                <td>${leave.endDate ? new Date(leave.endDate).toLocaleDateString() : 'N/A'}</td>
                                <td>${leave.duration || 'N/A'}</td>
                                <td>${leave.status || 'N/A'}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            `;
        }

        const blob = new Blob([htmlContent], { type: "application/vnd.ms-excel;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0, 10)}.xls`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`${filename} exported to Excel`);
    };

    const exportToPDF = (data, filename) => {
        if (!data || data.length === 0) {
            toast.error("No data to export");
            return;
        }

        const doc = new jsPDF();
        doc.text(`${filename.replace('_', ' ').toUpperCase()}`, 14, 15);

        let head = [];
        let body = [];

        if (activeTab === 'Employees') {
            head = [['Name', 'Email', 'Department', 'Position', 'Joined Date']];
            body = data.map(emp => [
                emp.name,
                emp.email,
                emp.department || 'N/A',
                emp.designation || 'N/A',
                emp.doj ? new Date(emp.doj).toLocaleDateString() : 'N/A'
            ]);
        } else if (activeTab === 'Attendance') {
            head = [['Employee', 'Department', 'Date', 'Check In', 'Check Out', 'Hours', 'Status']];
            body = data.map(att => [
                att.employee?.name || 'N/A',
                att.employee?.department || 'N/A',
                att.date ? new Date(att.date).toLocaleDateString() : 'N/A',
                att.checkIn ? new Date(att.checkIn).toLocaleTimeString() : 'N/A',
                att.checkOut ? new Date(att.checkOut).toLocaleTimeString() : 'N/A',
                att.workingHours || 'N/A',
                att.status || 'N/A'
            ]);
        } else if (activeTab === 'Leave') {
            head = [['Employee', 'Department', 'Type', 'From', 'To', 'Days', 'Status']];
            body = data.map(leave => [
                leave.employeeId?.name || 'N/A',
                leave.employeeId?.department || 'N/A',
                leave.type || 'N/A',
                leave.startDate ? new Date(leave.startDate).toLocaleDateString() : 'N/A',
                leave.endDate ? new Date(leave.endDate).toLocaleDateString() : 'N/A',
                leave.duration || 'N/A',
                leave.status || 'N/A'
            ]);
        }

        autoTable(doc, {
            head: head,
            body: body,
            startY: 20,
            theme: 'striped',
            styles: { fontSize: 8 },
            headStyles: { fillColor: [16, 185, 129] }
        });

        doc.save(`${filename}_${new Date().toISOString().slice(0, 10)}.pdf`);
        toast.success(`${filename} exported to PDF`);
    };

    const handleExportCurrentData = (format) => {
        let data, filename;

        if (activeTab === 'Employees') {
            data = employees;
            filename = 'employees_report';
        } else if (activeTab === 'Attendance') {
            data = attendance;
            filename = 'attendance_report';
        } else if (activeTab === 'Leave') {
            data = leaves;
            filename = 'leave_report';
        }

        if (format === 'csv') {
            exportToCSV(data, filename);
        } else if (format === 'excel') {
            exportToExcel(data, filename);
        } else if (format === 'pdf') {
            exportToPDF(data, filename);
        }
    };

    // Build dept chart from employees (not used in UI anymore)
    // const deptMap = employees.reduce((acc, e) => {
    //     const d = e.department || 'Other';
    //     acc[d] = (acc[d] || 0) + 1;
    //     return acc;
    // }, {});
    // const deptChartData = Object.entries(deptMap).map(([name, count]) => ({ name, count }));

    // const leaveChartData = charts ? [
    //     { name: 'Approved', value: charts.leaves?.approved || 0 },
    //     { name: 'Rejected', value: charts.leaves?.rejected || 0 },
    //     { name: 'Pending', value: charts.leaves?.pending || 0 },
    // ] : [];

    const statusBadge = (status, map) => {
        const cls = map[status] || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
        return <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${cls}`}>{status || '—'}</span>;
    };

    const attBadgeMap = {
        Present: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        Overtime: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        Late: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        'Half Day': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        Absent: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    };

    const leaveBadgeMap = {
        Approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        Pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        Rejected: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    };

    const empColumns = [
        {
            header: 'Employee',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 font-bold text-sm">
                        {row.name?.charAt(0) || '?'}
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{row.name}</p>
                        <p className="text-[11px] text-gray-400">{row.email}</p>
                    </div>
                </div>
            ),
        },
        { header: 'Department', accessor: 'department' },
        { header: 'Position', accessor: 'designation' },
        {
            header: 'Joined',
            render: (row) => <span>{row.doj ? new Date(row.doj).toLocaleDateString() : '—'}</span>,
        },
    ];

    const attColumns = [
        {
            header: 'Employee',
            render: (row) => (
                <span className="font-medium text-gray-800 dark:text-gray-200">
                    {row.employee?.name || '—'}
                    <span className="block text-[10px] text-gray-400">
                        {row.employee?.department || ''}
                    </span>
                </span>
            ),
        },
        { header: 'Date', render: (row) => <span>{row.date ? new Date(row.date).toLocaleDateString() : '—'}</span> },
        { header: 'Check In', render: (row) => <span>{row.checkIn ? new Date(row.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</span> },
        { header: 'Check Out', render: (row) => <span>{row.checkOut ? new Date(row.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</span> },
        { header: 'Hours', render: (row) => <span>{row.workingHours ? `${row.workingHours}h` : '—'}</span> },
        { header: 'Status', render: (row) => statusBadge(row.status, attBadgeMap) },
    ];

    const leaveColumns = [
        {
            header: 'Employee',
            render: (row) => (
                <span className="font-medium text-gray-800 dark:text-gray-200">
                    {row.employeeId?.name || '—'}
                    <span className="block text-[10px] text-gray-400">{row.employeeId?.department || ''}</span>
                </span>
            ),
        },
        { header: 'Type', render: (row) => <span className="font-medium">{row.type || '—'}</span> },
        { header: 'From', render: (row) => <span>{row.startDate ? new Date(row.startDate).toLocaleDateString() : '—'}</span> },
        { header: 'To', render: (row) => <span>{row.endDate ? new Date(row.endDate).toLocaleDateString() : '—'}</span> },
        { header: 'Days', accessor: 'duration' },
        { header: 'Status', render: (row) => statusBadge(row.status, leaveBadgeMap) },

    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Reports & Data Export</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">View and export company data in multiple formats.</p>
                </div>

                <div className="flex gap-2">
                    <button onClick={() => handleExportCurrentData('csv')} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg text-sm font-bold hover:from-emerald-600 hover:to-emerald-700 transition duration-300 shadow-sm active:scale-95">
                        <Download size={16} /> CSV
                    </button>
                    <button onClick={() => handleExportCurrentData('excel')} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg text-sm font-bold hover:from-emerald-600 hover:to-emerald-700 transition duration-300 shadow-sm active:scale-95">
                        <FileText size={16} /> Excel
                    </button>
                    <button onClick={() => handleExportCurrentData('pdf')} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg text-sm font-bold hover:from-emerald-600 hover:to-emerald-700 transition duration-300 shadow-sm active:scale-95">
                        <File size={16} /> PDF
                    </button>
                </div>
            </div>

            {/* Tab Nav */}
            <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-xl w-fit">
                {TABS.map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                        className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab
                            ? 'bg-white dark:bg-gray-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}>
                        {tab}
                        <span className="ml-1.5 text-[10px] font-bold text-gray-400">
                            ({tab === 'Employees' ? employees.length : tab === 'Attendance' ? attendance.length : leaves.length})
                        </span>
                    </button>
                ))}
            </div>

            {activeTab === 'Employees' && <ReusableTable columns={empColumns} data={employees} placeholder="Search employees..." />}
            {activeTab === 'Attendance' && <ReusableTable columns={attColumns} data={attendance} placeholder="Search attendance..." />}
            {activeTab === 'Leave' && <ReusableTable columns={leaveColumns} data={leaves} placeholder="Search leave requests..." />}
        </div>
    );
};

export default Reports;
