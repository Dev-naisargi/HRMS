import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

const ReusableTable = ({ columns, data, searchable = true, placeholder = "Search..." }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 5;

    const filteredData = data.filter(row =>
        Object.values(row).some(val =>
            String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const totalPages = Math.ceil(filteredData.length / rowsPerPage) || 1;
    const currentData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden flex flex-col">
            {searchable && (
                <div className="p-5 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-md">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder={placeholder}
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1); // Reset pagination on search
                            }}
                            className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-white transition-all shadow-sm"
                        />
                    </div>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/80 dark:bg-gray-800/40 border-b border-gray-100 dark:border-gray-800">
                        <tr>
                            {columns.map((col, idx) => (
                                <th key={idx} className="px-6 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
                        {currentData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="text-center py-16">
                                    <p className="text-sm font-bold text-gray-400 dark:text-gray-500">No records found matching your criteria</p>
                                </td>
                            </tr>
                        ) : (
                            currentData.map((row, idx) => (
                                <tr key={idx} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors group">
                                    {columns.map((col, colIdx) => (
                                        <td key={colIdx} className="px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-300">
                                            {col.render ? col.render(row) : row[col.accessor]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="p-4 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between bg-gray-50/30 dark:bg-gray-900/30">
                <span className="text-xs font-bold text-gray-400 dark:text-gray-500">
                    Showing {filteredData.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, filteredData.length)} of {filteredData.length} records
                </span>
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 disabled:opacity-30 hover:bg-white dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-all shadow-sm disabled:shadow-none"
                    >
                        <ChevronLeft size={16} strokeWidth={2.5} />
                    </button>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 disabled:opacity-30 hover:bg-white dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-all shadow-sm disabled:shadow-none"
                    >
                        <ChevronRight size={16} strokeWidth={2.5} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReusableTable;
