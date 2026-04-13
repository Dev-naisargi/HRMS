import React from 'react';

const StatCard = ({ title, value, icon, colorClass }) => {
    const IconComponent = icon;
    const iconColor = colorClass || 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';

    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-4">
            <div className={`w-12 h-12 flex items-center justify-center rounded-xl shrink-0 ${iconColor}`}>
                <IconComponent size={22} />
            </div>
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-0.5 leading-none">
                    {value ?? '—'}
                </h3>
            </div>
        </div>
    );
};

export default StatCard;
