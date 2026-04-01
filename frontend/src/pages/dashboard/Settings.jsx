import React from 'react';

const Settings = () => {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-black text-gray-800 dark:text-white tracking-tight">Platform Settings</h2>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
                    Configure global variables and access controls.
                </p>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] p-8 shadow-sm max-w-2xl">
                <form className="space-y-6">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Company Name</label>
                        <input
                            type="text"
                            defaultValue="Dunder Mifflin Paper Co."
                            className="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:border-emerald-500 font-medium text-sm dark:text-white"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Support Email</label>
                        <input
                            type="email"
                            defaultValue="admin@dundermifflin.com"
                            className="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:border-emerald-500 font-medium text-sm dark:text-white"
                        />
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                        <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl w-full sm:w-auto shadow-md transition-all active:scale-95">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Settings;
