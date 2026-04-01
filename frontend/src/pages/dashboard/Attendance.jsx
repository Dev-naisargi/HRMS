import React, { useState, useEffect } from 'react';
import StatCard from '../../components/StatCard';
import api from '../../utils/api';
import { CheckCircle, XCircle, Clock, AlertCircle, Coffee, Play, Ban } from 'lucide-react';

const STATUS_BADGE = {
    Present: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    Absent: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300',
    Late: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    'Half Day': 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    Overtime: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
};

/* ── Stamp config: label, color, icon ── */
const STAMP_CONFIG = {
    not_started: {
        label: 'Not Checked In',
        color: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
        icon: Clock,
    },
    checked_in: {
        label: 'You are Checked In',
        color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300',
        icon: CheckCircle,
    },
    on_break: {
        label: '☕ On Break',
        color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300',
        icon: Coffee,
    },
    resumed: {
        label: 'Back from Break',
        color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300',
        icon: Play,
    },
    checked_out: {
        label: 'Checked Out',
        color: 'bg-red-100 text-red-500 dark:bg-red-900/40 dark:text-red-300',
        icon: XCircle,
    },
};

/* ── Weekend helper ── */
const checkIsWeekend = () => {
    const day = new Date().getDay(); // 0 = Sunday, 6 = Saturday
    return day === 0 || day === 6;
};

const getDayName = () => {
    return new Date().toLocaleDateString('en-US', { weekday: 'long' });
};

const Attendance = () => {
    const role = localStorage.getItem('role')?.toUpperCase() || 'EMPLOYEE';

    // ── Employee state ──
    const [myAttendance, setMyAttendance] = useState([]);
    const [stampStatus, setStampStatus] = useState('not_started');
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

    // ── HR/Admin state ──
    const [allAttendance, setAllAttendance] = useState([]);
    const [loading, setLoading] = useState(true);

    // ── Weekend check ──
    const isWeekend = checkIsWeekend();
    const todayName = getDayName();

    /* ── Fetch my attendance ── */
    const fetchMyAttendance = async () => {
        try {
            const res = await api.get('/attendance/my');
            const records = Array.isArray(res.data) ? res.data : [];
            setMyAttendance(records);

            const today = new Date().toDateString();
            const todayRecord = records.find(
                r => new Date(r.date).toDateString() === today
            );

            if (todayRecord) {
                setStampStatus(todayRecord.stampStatus || 'not_started');
            } else {
                setStampStatus('not_started');
            }
        } catch (err) {
            console.error('Failed to fetch attendance', err);
        } finally {
            setLoading(false);
        }
    };

    /* ── Fetch all attendance (HR/Admin) ── */
    const fetchAllAttendance = async () => {
        try {
            const res = await api.get('/attendance/all');
            setAllAttendance(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('Failed to fetch all attendance', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (role === 'EMPLOYEE') {
            fetchMyAttendance();
        } else {
            fetchAllAttendance();
        }
        const interval = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
        return () => clearInterval(interval);
    }, [role]);

    /* ══════════════════════════════════════════
       4 STAMP HANDLERS
    ══════════════════════════════════════════ */
    const handleCheckIn = async () => {
        try {
            await api.post('/attendance/checkin');
            fetchMyAttendance();
        } catch (err) {
            alert(err.response?.data?.message || 'Check-in failed');
        }
    };

    const handleBreakStart = async () => {
        try {
            await api.put('/attendance/break/start');
            fetchMyAttendance();
        } catch (err) {
            alert(err.response?.data?.message || 'Break start failed');
        }
    };

    const handleBreakEnd = async () => {
        try {
            await api.put('/attendance/break/end');
            fetchMyAttendance();
        } catch (err) {
            alert(err.response?.data?.message || 'Resume failed');
        }
    };

    const handleCheckOut = async () => {
        try {
            await api.put('/attendance/checkout');
            fetchMyAttendance();
        } catch (err) {
            alert(err.response?.data?.message || 'Check-out failed');
        }
    };

    /* ── Employee Stats ── */
    const presentCount = myAttendance.filter(a => a.status === 'Present' || a.status === 'Overtime').length;
    const absentCount = myAttendance.filter(a => a.status === 'Absent').length;
    const lateCount = myAttendance.filter(a => a.isLate === true).length;
    const halfDayCount = myAttendance.filter(a => a.status === 'Half Day').length;

    /* ── HR Stats ── */
    const hrPresent = allAttendance.filter(a => a.status === 'Present' || a.status === 'Overtime').length;
    const hrAbsent = allAttendance.filter(a => a.status === 'Absent').length;
    const hrLate = allAttendance.filter(a => a.isLate).length;
    const hrHalf = allAttendance.filter(a => a.status === 'Half Day').length;

    const formatTime = (t) =>
        t ? new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full" />
        </div>
    );

    /* ══════════════════════════════════════════════
       EMPLOYEE VIEW
    ══════════════════════════════════════════════ */
    if (role === 'EMPLOYEE') {
        const stampCfg = STAMP_CONFIG[stampStatus] || STAMP_CONFIG.not_started;
        const StatusIcon = stampCfg.icon;

        return (
            <div className="space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">My Attendance</h1>
                        <p className="text-sm text-gray-400 mt-1">Track your daily attendance records</p>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200">
                        <Clock size={16} /> {currentTime}
                    </div>
                </div>

                {/* ── Weekend Banner ── */}
                {isWeekend && (
                    <div className="flex items-center gap-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl px-5 py-4">
                        <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center text-orange-500">
                            <Ban size={20} />
                        </div>
                        <div>
                            <p className="font-semibold text-orange-700 dark:text-orange-300">
                                It's {todayName} — Weekend!
                            </p>
                            <p className="text-sm text-orange-500 dark:text-orange-400 mt-0.5">
                                Attendance check-in is not available on Saturday & Sunday. Enjoy your day off! 🎉
                            </p>
                        </div>
                    </div>
                )}

                {/* Stat Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                    <StatCard title="Present Days" value={presentCount} icon={CheckCircle}
                        colorClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" />
                    <StatCard title="Absent Days" value={absentCount} icon={XCircle}
                        colorClass="bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400" />
                    <StatCard title="Late Days" value={lateCount} icon={Clock}
                        colorClass="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" />
                    <StatCard title="Half Days" value={halfDayCount} icon={AlertCircle}
                        colorClass="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" />
                </div>

                {/* ── 4 Stamp Card ── */}
                <div className={`bg-white dark:bg-gray-800 rounded-2xl border shadow-sm p-6 transition-all
                    ${isWeekend
                        ? 'border-orange-100 dark:border-orange-900/40 opacity-60'
                        : 'border-gray-100 dark:border-gray-700'
                    }`}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">

                        {/* Status indicator */}
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isWeekend ? 'bg-orange-100 text-orange-400 dark:bg-orange-900/40' : stampCfg.color}`}>
                                {isWeekend ? <Ban size={22} /> : <StatusIcon size={22} />}
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Today's Status</p>
                                <p className="text-lg font-semibold text-gray-800 dark:text-white mt-1">
                                    {isWeekend ? `${todayName} — No Attendance` : stampCfg.label}
                                </p>
                            </div>
                        </div>

                        {/* ── Stamp Buttons ── */}
                        <div className="flex items-center gap-3 flex-wrap">

                            {/* Weekend — disabled check in */}
                            {isWeekend && (
                                <button disabled
                                    className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 rounded-xl font-semibold cursor-not-allowed flex items-center gap-2">
                                    <Ban size={16} /> Check In Unavailable
                                </button>
                            )}

                            {/* STAMP 1: Check In (weekdays only) */}
                            {!isWeekend && stampStatus === 'not_started' && (
                                <button onClick={handleCheckIn}
                                    className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition active:scale-95 flex items-center gap-2">
                                    <CheckCircle size={16} /> Check In
                                </button>
                            )}

                            {/* STAMP 2 & 4: Break + Check Out */}
                            {!isWeekend && (stampStatus === 'checked_in' || stampStatus === 'resumed') && (
                                <>
                                    <button onClick={handleBreakStart}
                                        className="px-6 py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition active:scale-95 flex items-center gap-2">
                                        <Coffee size={16} /> Break
                                    </button>
                                    <button onClick={handleCheckOut}
                                        className="px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition active:scale-95 flex items-center gap-2">
                                        <XCircle size={16} /> Check Out
                                    </button>
                                </>
                            )}

                            {/* STAMP 3: Resume */}
                            {!isWeekend && stampStatus === 'on_break' && (
                                <button onClick={handleBreakEnd}
                                    className="px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition active:scale-95 flex items-center gap-2">
                                    <Play size={16} /> Resume
                                </button>
                            )}

                            {/* Done */}
                            {!isWeekend && stampStatus === 'checked_out' && (
                                <span className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-xl font-semibold">
                                    ✅ Done for today
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Stamp progress indicator — hide on weekends */}
                    {!isWeekend && (
                        <div className="mt-6 flex items-center gap-2">
                            {[
                                { key: 'checked_in', label: 'Check In', color: 'bg-emerald-500' },
                                { key: 'on_break', label: 'Break', color: 'bg-amber-500' },
                                { key: 'resumed', label: 'Resume', color: 'bg-blue-500' },
                                { key: 'checked_out', label: 'Check Out', color: 'bg-red-500' },
                            ].map((step, i) => {
                                const order = ['checked_in', 'on_break', 'resumed', 'checked_out'];
                                const currentIndex = order.indexOf(stampStatus);
                                const stepIndex = order.indexOf(step.key);
                                const isDone = currentIndex >= stepIndex && stampStatus !== 'not_started';

                                return (
                                    <React.Fragment key={step.key}>
                                        <div className="flex flex-col items-center gap-1">
                                            <div className={`w-3 h-3 rounded-full transition-all ${isDone ? step.color : 'bg-gray-200 dark:bg-gray-600'}`} />
                                            <span className={`text-[10px] font-medium ${isDone ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'}`}>
                                                {step.label}
                                            </span>
                                        </div>
                                        {i < 3 && (
                                            <div className={`flex-1 h-0.5 mb-4 rounded transition-all ${currentIndex > stepIndex && stampStatus !== 'not_started' ? step.color : 'bg-gray-200 dark:bg-gray-600'}`} />
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Attendance Table */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                        <h3 className="font-bold text-gray-800 dark:text-white">Attendance Records</h3>
                    </div>

                    {myAttendance.length === 0 ? (
                        <div className="py-16 text-center text-gray-400 dark:text-gray-500">
                            <Clock size={36} className="mx-auto mb-3" strokeWidth={1.5} />
                            <p className="font-medium">No attendance records yet</p>
                            <p className="text-sm mt-1">Clock in to start tracking your attendance</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        {['Date', 'Check In', 'Break', 'Resume', 'Check Out', 'Hours', 'Status'].map(h => (
                                            <th key={h} className="px-6 py-3 text-xs font-bold uppercase text-gray-500 dark:text-gray-300 tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {myAttendance.map(record => (
                                        <tr key={record._id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition">
                                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-200 font-medium">
                                                {new Date(record.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                                {formatTime(record.checkIn)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                                {formatTime(record.breakStart)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                                {formatTime(record.breakEnd)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                                {formatTime(record.checkOut)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                                {record.workingHours != null ? `${record.workingHours}h` : '—'}
                                                {record.breakMinutes > 0 && (
                                                    <span className="ml-1 text-xs text-amber-500">(-{record.breakMinutes}m break)</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2 flex-wrap">
                                                    <span className={`px-3 py-1 rounded-lg text-xs font-bold ${STATUS_BADGE[record.status] || ''}`}>
                                                        {record.status || '—'}
                                                    </span>
                                                    {record.isLate && (
                                                        <span className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                                                            Late
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    /* ══════════════════════════════════════════════
       HR / ADMIN VIEW
    ══════════════════════════════════════════════ */
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Company Attendance</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">All employee attendance logs.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                <StatCard title="Present" value={hrPresent} icon={CheckCircle}
                    colorClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" />
                <StatCard title="Absent" value={hrAbsent} icon={XCircle}
                    colorClass="bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400" />
                <StatCard title="Late" value={hrLate} icon={Clock}
                    colorClass="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" />
                <StatCard title="Half Days" value={hrHalf} icon={AlertCircle}
                    colorClass="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="font-bold text-gray-800 dark:text-white">All Attendance Records</h3>
                </div>
                {allAttendance.length === 0 ? (
                    <div className="py-16 text-center text-gray-400"><p>No attendance records found.</p></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    {['Employee', 'Date', 'Check In', 'Break', 'Resume', 'Check Out', 'Hours', 'Status'].map(h => (
                                        <th key={h} className="px-6 py-3 text-xs font-bold uppercase text-gray-500 dark:text-gray-300 tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {allAttendance.map(record => (
                                    <tr key={record._id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition">
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-sm text-gray-800 dark:text-gray-200 leading-none">{record.employee?.name || '—'}</p>
                                            <p className="text-[10px] text-gray-400 mt-0.5">{record.employee?.department || ''}</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-200 font-medium">
                                            {new Date(record.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{formatTime(record.checkIn)}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{formatTime(record.breakStart)}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{formatTime(record.breakEnd)}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{formatTime(record.checkOut)}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {record.workingHours != null ? `${record.workingHours}h` : '—'}
                                            {record.breakMinutes > 0 && (
                                                <span className="ml-1 text-xs text-amber-500">(-{record.breakMinutes}m)</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2 flex-wrap">
                                                <span className={`px-3 py-1 rounded-lg text-xs font-bold ${STATUS_BADGE[record.status] || 'bg-gray-100 text-gray-500'}`}>
                                                    {record.status || '—'}
                                                </span>
                                                {record.isLate && (
                                                    <span className="px-2 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">Late</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Attendance;