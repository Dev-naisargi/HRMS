import React from "react";
import { Activity } from "lucide-react";

// Mock data for activity, since we don't have an audit log database model yet.
const recentActivity = [
    { id: 1, text: "System Boot and Health Check passed", time: "10 mins ago", type: "alert" },
    { id: 2, text: "New company 'TechFlow Inc' registered", time: "2 hours ago", type: "company" },
    { id: 3, text: "Subscription upgraded by 'Innovate LLC'", time: "4 hours ago", type: "billing" },
    { id: 4, text: "System threshold alert: High DB CPU usage", time: "5 hours ago", type: "alert" },
    { id: 5, text: "New HR account created for 'Apex Corp'", time: "1 day ago", type: "user" },
    { id: 6, text: "Platform v2.4.1 deployed successfully", time: "2 days ago", type: "system" },
];

const ActivityLogs = () => {
    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">System Activity Logs</h3>
                <p className="text-xs text-gray-500 mt-1">Real-time audit trailing across all platform layers.</p>
            </div>

            <div className="p-6">
                <div className="space-y-6">
                    {recentActivity.map((log) => (
                        <div key={log.id} className="flex gap-4 items-start relative">
                            {/* Timeline Line */}
                            <div className="absolute left-1.5 top-5 bottom-0 w-0.5 bg-gray-100 dark:bg-gray-800 -ml-px"></div>

                            <div className={`relative z-10 w-3 h-3 mt-1 rounded-full ${log.type === 'company' ? 'bg-emerald-500' :
                                    log.type === 'alert' ? 'bg-rose-500' :
                                        log.type === 'billing' ? 'bg-purple-500' :
                                            log.type === 'system' ? 'bg-indigo-500' : 'bg-blue-500'
                                } ring-4 ring-white dark:ring-gray-900`}></div>

                            <div className="flex-1">
                                <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">{log.text}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{log.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ActivityLogs;
