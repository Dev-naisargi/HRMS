import React, { useState } from "react";
import { CreditCard, CheckCircle2, TrendingUp, Users, ChevronRight, Edit3, X } from "lucide-react";

// Mock Data
const plans = [
    { id: "basic", name: "Basic", price: "$49/mo", activeUsers: 145, features: ["Up to 50 Employees", "Basic Reporting", "Email Support", "Core HR Features"] },
    { id: "pro", name: "Pro", price: "$129/mo", activeUsers: 312, popular: true, features: ["Up to 500 Employees", "Advanced Analytics", "Priority Support", "Payroll Integration", "Custom Workflows"] },
    { id: "enterprise", name: "Enterprise", price: "$499/mo", activeUsers: 89, features: ["Unlimited Employees", "Dedicated Account Manager", "24/7 Phone Support", "Custom API Integrations", "Audit Logs"] },
];

const subscriptions = [
    { id: 1, company: "TechFlow Inc", plan: "Pro", start: "2023-11-01", expiry: "2024-11-01", status: "Active" },
    { id: 2, company: "Apex Corp", plan: "Enterprise", start: "2024-01-15", expiry: "2025-01-15", status: "Active" },
    { id: 3, company: "Innovate LLC", plan: "Basic", start: "2023-09-10", expiry: "2023-10-10", status: "Expired" },
    { id: 4, company: "Globalsys", plan: "Pro", start: "2024-03-01", expiry: "2024-03-15", status: "Trial" },
];

const Subscriptions = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState(null);

    const openModal = (sub) => {
        setSelectedCompany(sub);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-7xl">

            <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Subscription Management</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage tenant billing, active plans, and pricing tiers.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg"><TrendingUp size={18} /></div>
                        <div><p className="text-xs text-gray-500">Monthly Revenue (MRR)</p><p className="font-bold text-gray-900 dark:text-white">$45,200</p></div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg"><CreditCard size={18} /></div>
                        <div><p className="text-xs text-gray-500">Active Plans</p><p className="font-bold text-gray-900 dark:text-white">546</p></div>
                    </div>
                </div>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                {plans.map((plan) => (
                    <div key={plan.id} className={`relative bg-white dark:bg-gray-900 border ${plan.popular ? 'border-emerald-500 ring-1 ring-emerald-500 shadow-md' : 'border-gray-200 dark:border-gray-800 shadow-sm'} rounded-2xl p-6 flex flex-col`}>
                        {plan.popular && (
                            <div className="absolute top-0 right-6 -translate-y-1/2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-[10px] font-bold uppercase tracking-widest py-1 px-3 rounded-full">
                                Most Popular
                            </div>
                        )}
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                        <div className="mt-4 flex items-baseline text-3xl font-extrabold text-gray-900 dark:text-white">
                            {plan.price}
                            <span className="ml-1 text-sm font-medium text-gray-500">/organization</span>
                        </div>

                        <div className="mt-6 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 pb-6 border-b border-gray-100 dark:border-gray-800">
                            <Users size={16} className="text-gray-400" />
                            <span className="font-semibold text-gray-800 dark:text-gray-200">{plan.activeUsers}</span> active tenants
                        </div>

                        <ul className="mt-6 space-y-4 flex-1">
                            {plan.features.map((feature, idx) => (
                                <li key={idx} className="flex gap-3 text-sm text-gray-600 dark:text-gray-400">
                                    <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <button className={`mt-8 w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${plan.popular ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'}`}>
                            Edit Plan Details
                        </button>
                    </div>
                ))}
            </div>

            {/* Subscriptions Table */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden mt-8">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">Tenant Billing Overview</h3>
                    <input type="text" placeholder="Search tenant..." className="px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/30 w-64" />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
                        <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-semibold border-b border-gray-200 dark:border-gray-800">
                            <tr>
                                <th className="px-6 py-4">Company</th>
                                <th className="px-6 py-4">Current Plan</th>
                                <th className="px-6 py-4">Start Date</th>
                                <th className="px-6 py-4">Expiry Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                            {subscriptions.map(sub => (
                                <tr key={sub.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-gray-800 dark:text-gray-200">{sub.company}</td>
                                    <td className="px-6 py-4">
                                        <span className="flex items-center gap-1.5">
                                            <div className={`w-2 h-2 rounded-full ${sub.plan === 'Enterprise' ? 'bg-purple-500' : sub.plan === 'Pro' ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
                                            {sub.plan}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs">{sub.start}</td>
                                    <td className="px-6 py-4 text-xs">{sub.expiry}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full ${sub.status === "Active" ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" :
                                                sub.status === "Expired" ? "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400" :
                                                    "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                                            }`}>
                                            {sub.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => openModal(sub)} className="text-emerald-600 dark:text-emerald-500 hover:text-emerald-700 font-medium text-xs flex items-center justify-end gap-1 w-full">
                                            <Edit3 size={14} /> Change Plan
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Change Plan Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Modify Tenant Subscription</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 p-1.5 rounded-lg transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Target Company</label>
                                <input type="text" value={selectedCompany?.company || ""} disabled readOnly className="w-full text-sm px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 opacity-80 cursor-not-allowed" />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Select New Plan</label>
                                <select className="w-full text-sm px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-200 outline-none focus:ring-2 focus:ring-emerald-500/30">
                                    <option selected={selectedCompany?.plan === 'Basic'}>Basic ($49/mo)</option>
                                    <option selected={selectedCompany?.plan === 'Pro'}>Pro ($129/mo)</option>
                                    <option selected={selectedCompany?.plan === 'Enterprise'}>Enterprise ($499/mo)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Override Expiry Date</label>
                                <input type="date" defaultValue={selectedCompany?.expiry} className="w-full text-sm px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-200 outline-none focus:ring-2 focus:ring-emerald-500/30" />
                            </div>
                        </div>

                        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                                Cancel
                            </button>
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl shadow-sm transition-colors">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Subscriptions;
