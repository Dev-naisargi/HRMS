import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../components/StatCard';
import {
    Users, UserCheck, Building2, Clock,
    CalendarDays, FileText, DollarSign, CheckCircle,
    Plus, UserPlus, ClipboardList, TrendingUp, LogIn, Calendar
} from 'lucide-react';
import {
    BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, Tooltip, CartesianGrid,
    ResponsiveContainer, Legend
} from 'recharts';
import api from '../../utils/api';

const COLORS = ['#10B981', '#EF4444', '#F59E0B'];

const Overview = () => {
    const navigate = useNavigate();
    const role = (localStorage.getItem('role') || '').trim().toUpperCase();
    const [stats, setStats] = useState({ totalHR: 0, totalEmployees: 0, departments: 0 });
    const [attendanceData, setAttendanceData] = useState([]);
    const [leaveData, setLeaveData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [apiError, setApiError] = useState("");
    const [employeeData, setEmployeeData] = useState({
        department: '',
        leaves: 0,
        todayStatus: '',
        salary: 0,
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setApiError("");

            try {
                if (role === 'ADMIN') {
                    const [statsRes, chartRes] = await Promise.all([
                        api.get('/admin/stats'),
                        api.get('/admin/charts'),
                    ]);

                    setStats(statsRes.data);
                    const d = chartRes.data || {};
                    setAttendanceData([
                        { name: 'Present', value: d?.attendance?.present || 0 },
                        { name: 'Absent', value: d?.attendance?.absent || 0 },
                        { name: 'Late', value: d?.attendance?.late || 0 },
                    ]);
                    setLeaveData([
                        { name: 'Approved', value: d?.leaves?.approved || 0 },
                        { name: 'Pending', value: d?.leaves?.pending || 0 },
                        { name: 'Rejected', value: d?.leaves?.rejected || 0 },
                    ]);
                } else if (role === 'HR') {
                    const [statsRes, leaveRes] = await Promise.allSettled([
                        api.get('/admin/stats'),
                        api.get('/leave')
                    ]);

                    if (statsRes.status === 'fulfilled') {
                        setStats(statsRes.value.data || {});
                    } else {
                        console.error('Stats API failed:', statsRes.reason);
                        setStats({ totalEmployees: 0, totalHR: 0, departments: 0 });
                    }

                    if (leaveRes.status === 'fulfilled') {
                        const leaves = Array.isArray(leaveRes.value.data) ? leaveRes.value.data : [];
                        setLeaveData([
                            { name: 'Approved', value: leaves.filter(l => l.status === 'Approved' || l.status === 'APPROVED').length },
                            { name: 'Pending', value: leaves.filter(l => l.status === 'Pending' || l.status === 'PENDING').length },
                            { name: 'Rejected', value: leaves.filter(l => l.status === 'Rejected' || l.status === 'REJECTED').length },
                        ]);
                    } else {
                        console.error('Leave API failed:', leaveRes.reason);
                        setLeaveData([{ name: 'Approved', value: 0 }, { name: 'Pending', value: 0 }, { name: 'Rejected', value: 0 }]);
                    }
                } else if (role === 'EMPLOYEE') {
                    const attendanceRes = await api.get('/attendance/my').catch(() => ({ data: [] }));
                    const leaveRes = await api.get('/leave/').catch(() => ({ data: [] }));
                    const payrollRes = await api.get('/payroll').catch(() => ({ data: [] }));

                    const attendanceList = Array.isArray(attendanceRes.data) ? attendanceRes.data : [];
                    const leaveList = Array.isArray(leaveRes.data) ? leaveRes.data : [];
                    const payrollList = Array.isArray(payrollRes.data) ? payrollRes.data : [];

                    const today = new Date().toDateString();
                    const todayAttendance = attendanceList.find(a => new Date(a.date).toDateString() === today);
                    const approvedLeaves = leaveList.filter(l => l.status === 'Approved' || l.status === 'APPROVED');
                    const usedLeaveDays = approvedLeaves.reduce((total, l) => total + (l.duration || 1), 0);
                    const latestPayroll = payrollList[0];

                    const day = new Date().getDay();
                    let todayStatus = 'Absent';
                    if (day === 0) {
                        todayStatus = 'Sunday';
                    } else if (todayAttendance) {
                        todayStatus = todayAttendance.status;
                    }

                    setEmployeeData({
                        department: 'IT',
                        leaves: Math.max(0, 12 - usedLeaveDays),
                        todayStatus,
                        salary: latestPayroll?.netPay || 0,
                    });
                }
            } catch (err) {
                console.error('Overview error:', err);
                setApiError('Unable to fetch dashboard data. Please check backend service.');
                setStats({ totalHR: 0, totalEmployees: 0, departments: 0 });
                setAttendanceData([{ name: 'Present', value: 0 }, { name: 'Absent', value: 0 }, { name: 'Late', value: 0 }]);
                setLeaveData([{ name: 'Approved', value: 0 }, { name: 'Pending', value: 0 }, { name: 'Rejected', value: 0 }]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [role]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    const QuickActions = ({ actions = [] }) => (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm mb-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {actions.map((action) => (
                    <button
                        key={action.label}
                        onClick={() => navigate(action.route)}
                        className="flex flex-col items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:border-gray-300 dark:hover:border-gray-600 transition-all group"
                    >
                        <div className={`w-10 h-10 rounded-xl ${action.bgClass} ${action.textClass} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            <action.icon size={20} />
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{action.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );

    const quickActionsByRole = {
        ADMIN: [
            { label: 'Add HR', route: '/dashboard/hr', icon: UserPlus, bgClass: 'bg-emerald-100 dark:bg-emerald-900/40', textClass: 'text-emerald-600 dark:text-emerald-300' },
            { label: 'Manage Payroll', route: '/dashboard/payroll', icon: DollarSign, bgClass: 'bg-blue-100 dark:bg-blue-900/40', textClass: 'text-blue-600 dark:text-blue-300' },
            { label: 'View Reports', route: '/dashboard/reports', icon: TrendingUp, bgClass: 'bg-purple-100 dark:bg-purple-900/40', textClass: 'text-purple-600 dark:text-purple-300' },
            { label: 'Approve Leaves', route: '/dashboard/leave', icon: CheckCircle, bgClass: 'bg-amber-100 dark:bg-amber-900/40', textClass: 'text-amber-600 dark:text-amber-300' },
        ],
        HR: [
            { label: 'Add Employee', route: '/dashboard/employees', icon: UserPlus, bgClass: 'bg-emerald-100 dark:bg-emerald-900/40', textClass: 'text-emerald-600 dark:text-emerald-300' },
            { label: 'Approve Leave', route: '/dashboard/leave', icon: CheckCircle, bgClass: 'bg-amber-100 dark:bg-amber-900/40', textClass: 'text-amber-600 dark:text-amber-300' },
            { label: 'Manage Attendance', route: '/dashboard/attendance', icon: ClipboardList, bgClass: 'bg-blue-100 dark:bg-blue-900/40', textClass: 'text-blue-600 dark:text-blue-300' },
            { label: 'View Employees', route: '/dashboard/employees', icon: Users, bgClass: 'bg-purple-100 dark:bg-purple-900/40', textClass: 'text-purple-600 dark:text-purple-300' },
        ],
        EMPLOYEE: [
            { label: 'Apply Leave', route: '/dashboard/leave', icon: CalendarDays, bgClass: 'bg-emerald-100 dark:bg-emerald-900/40', textClass: 'text-emerald-600 dark:text-emerald-300' },
            { label: 'Mark Attendance', route: '/dashboard/attendance', icon: LogIn, bgClass: 'bg-blue-100 dark:bg-blue-900/40', textClass: 'text-blue-600 dark:text-blue-300' },
            { label: 'View Payslip', route: '/dashboard/payroll', icon: FileText, bgClass: 'bg-purple-100 dark:bg-purple-900/40', textClass: 'text-purple-600 dark:text-purple-300' },
            { label: 'Update Profile', route: '/profile', icon: UserCheck, bgClass: 'bg-amber-100 dark:bg-amber-900/40', textClass: 'text-amber-600 dark:text-amber-300' },
        ],
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {role === 'ADMIN' ? 'Welcome, Admin' : role === 'HR' ? 'Welcome, HR' : 'Welcome'}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {role === 'ADMIN' ? 'Company analytics overview.' : role === 'HR' ? 'Team management overview.' : 'Your personal workspace.'}
                </p>
            </div>

            {apiError && (
                <div className="rounded-xl bg-red-100 text-red-700 border border-red-200 px-4 py-3 mb-4">
                    {apiError}
                </div>
            )}

            {/* ── ADMIN VIEW ── */}
            {role === 'ADMIN' && (
                <>
                    <QuickActions actions={quickActionsByRole.ADMIN} />

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        <StatCard
                            title="Total HR"
                            value={stats.totalHR}
                            icon={UserCheck}
                            colorClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                        />
                        <StatCard
                            title="Total Employees"
                            value={stats.totalEmployees}
                            icon={Users}
                            colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                        />
                        <StatCard
                            title="Departments"
                            value={stats.departments}
                            icon={Building2}
                            colorClass="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                        />
                        <StatCard
                            title="Pending Leaves"
                            value={leaveData.find(l => l.name === 'Pending')?.value ?? 0}
                            icon={Clock}
                            colorClass="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                        />
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-5">Attendance Overview</h3>
                            <div className="w-full h-72 min-w-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={attendanceData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} vertical={false} />
                                        <XAxis dataKey="name" stroke="#9CA3AF" axisLine={false} tickLine={false} fontSize={12} />
                                        <YAxis stroke="#9CA3AF" axisLine={false} tickLine={false} fontSize={12} />
                                        <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Bar dataKey="value" fill="#10B981" radius={[8, 8, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-5">Leave Distribution</h3>
                            <div className="w-full h-72 min-w-0">
                                {leaveData.reduce((sum, item) => sum + (item.value || 0), 0) > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={leaveData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={100} paddingAngle={4}>
                                                {leaveData.map((entry, i) => <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />)}
                                            </Pie>
                                            <Tooltip contentStyle={{ borderRadius: '10px', border: 'none' }} />
                                            <Legend iconType="circle" iconSize={10} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                                        No leave records available yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* ── HR VIEW ── */}
            {role === 'HR' && (
                <>
                    <QuickActions actions={quickActionsByRole.HR} />

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        <StatCard
                            title="Total Employees"
                            value={stats.totalEmployees}
                            icon={Users}
                            colorClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                        />
                        <StatCard
                            title="Total HR Officers"
                            value={stats.totalHR}
                            icon={UserCheck}
                            colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                        />
                        <StatCard
                            title="Departments"
                            value={stats.departments}
                            icon={Building2}
                            colorClass="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                        />
                        <StatCard
                            title="Pending Leaves"
                            value={leaveData.find(l => l.name === 'Pending')?.value ?? 0}
                            icon={Clock}
                            colorClass="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                        />
                    </div>
                </>
                
            )}

            {/* ── EMPLOYEE VIEW ── */}
            {role === 'EMPLOYEE' && (
                <>
                    <QuickActions actions={quickActionsByRole.EMPLOYEE} />

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        <StatCard
                            title="My Department"
                            value={employeeData.department || 'N/A'}
                            icon={Building2}
                            colorClass="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                        />
                        <StatCard
                            title="Available Leaves"
                            value={employeeData.leaves ?? 0}
                            icon={CalendarDays}
                            colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                        />
                        <StatCard
                            title="Today's Status"
                            value={employeeData.todayStatus || 'Absent'}
                            icon={Clock}
                            colorClass="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                        />
                        <StatCard
                            title="Net Salary"
                            value={`₹${employeeData.salary ?? 0}`}
                            icon={DollarSign}
                            colorClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default Overview;
