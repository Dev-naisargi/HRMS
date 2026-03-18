import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import ThemeToggle from "../../components/ThemeToggle";
import api from "../../utils/api";

const STATUS_BADGE = {
  Present:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  Absent: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300",
  Late: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  "Half Day":
    "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  Overtime: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
};

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [clockedIn, setClockedIn] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  const fetchAttendance = async () => {
    try {
      const res = await api.get("/attendance/my");
      setAttendance(res.data);

      const today = new Date().toDateString();

      const todayRecord = res.data.find(
        (record) =>
          new Date(record.date).toDateString() === today &&
          record.checkIn &&
          !record.checkOut,
      );

      setClockedIn(!!todayRecord);
    } catch (error) {
      console.error("Failed to fetch attendance");
    }
  };

  useEffect(() => {
    fetchAttendance();

    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleCheckIn = async () => {
    try {
      await api.post("/attendance/checkin");
      fetchAttendance();
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  const handleCheckOut = async () => {
    try {
      await api.put("/attendance/checkout");
      fetchAttendance();
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  const presentCount = attendance.filter((a) => a.status === "Present").length;
  const absentCount = attendance.filter((a) => a.status === "Absent").length;
  const lateCount = attendance.filter((a) => a.isLate === true).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            My Attendance
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Track your daily attendance records
          </p>
        </div>

        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200">
          <Clock size={16} />
          {currentTime}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Present Days" count={presentCount} color="emerald" />
        <StatCard title="Absent Days" count={absentCount} color="red" />
        <StatCard title="Late Days" count={lateCount} color="amber" />
      </div>

      {/* Clock Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              clockedIn
                ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300"
                : "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300"
            }`}
          >
            <Clock size={22} />
          </div>

          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Today's Status
            </p>
            <p className="text-lg font-semibold text-gray-800 dark:text-white mt-1">
              {clockedIn ? "You are clocked in" : "Not clocked in"}
            </p>
          </div>
        </div>

        {clockedIn ? (
          <button
            onClick={handleCheckOut}
            className="px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition"
          >
            Clock Out
          </button>
        ) : (
          <button
            onClick={handleCheckIn}
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition"
          >
            Clock In
          </button>
        )}
      </div>

      {/* Attendance Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-bold text-gray-800 dark:text-white">
            Attendance Records
          </h3>
        </div>

        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-xs uppercase text-gray-500 dark:text-gray-300">
                Date
              </th>
              <th className="px-6 py-3 text-xs uppercase text-gray-500 dark:text-gray-300">
                Check In
              </th>
              <th className="px-6 py-3 text-xs uppercase text-gray-500 dark:text-gray-300">
                Check Out
              </th>
              <th className="px-6 py-3 text-xs uppercase text-gray-500 dark:text-gray-300">
                Hours
              </th>
              <th className="px-6 py-3 text-xs uppercase text-gray-500 dark:text-gray-300">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {attendance.map((record) => (
              <tr
                key={record._id}
                className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-200">
                  {new Date(record.date).toLocaleDateString()}
                </td>

                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                  {record.checkIn
                    ? new Date(record.checkIn).toLocaleTimeString()
                    : "-"}
                </td>

                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                  {record.checkOut
                    ? new Date(record.checkOut).toLocaleTimeString()
                    : "-"}
                </td>

                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                  {record.workingHours || "-"}
                </td>

                <td className="px-6 py-4">
                  <div className="flex gap-2 flex-wrap">
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-bold ${STATUS_BADGE[record.status]}`}
                    >
                      {record.status}
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
    </div>
  );
};

/* STAT CARD */

const StatCard = ({ title, count, color }) => {
  const colorMap = {
    emerald:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300",
    red: "bg-red-50 text-red-600 dark:bg-red-900/40 dark:text-red-300",
    amber:
      "bg-amber-50 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300",
  };

  const iconMap = {
    "Present Days": <CheckCircle size={20} />,
    "Absent Days": <XCircle size={20} />,
    "Late Days": <Clock size={20} />,
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
      <div
        className={`w-10 h-10 flex items-center justify-center rounded-xl mb-4 ${colorMap[color]}`}
      >
        {iconMap[title]}
      </div>

      <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
        {count}
      </h2>

      <p className="text-gray-400 text-sm mt-1 font-medium">{title}</p>
    </div>
  );
};

export default Attendance;
