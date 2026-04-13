import React, { useEffect, useState } from 'react';
import StatCard from '../../components/StatCard';
import api from '../../utils/api';
import {
    UserPlus, Pencil, Trash2, X, Search, CheckCircle2, AlertCircle,
    Users, Mail, Phone, Building2, Calendar, ChevronDown, Eye, EyeOff, Filter,
} from 'lucide-react';

const DEPARTMENTS = [
    'Human Resources', 'IT', 'Sales', 'Accounting',
    'Marketing', 'Customer Support', 'Operations',
];

const AVATAR_COLORS = [
    'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
    'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
    'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
    'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
];

const getAvatarColor = (name) =>
    AVATAR_COLORS[name?.charCodeAt(0) % AVATAR_COLORS.length] || AVATAR_COLORS[0];

const Toast = ({ toast }) => {
    if (!toast.show) return null;
    return (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[500] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-sm transition-all duration-300 ${toast.type === 'success'
                ? 'bg-emerald-50/95 border-emerald-200 text-emerald-800 dark:bg-emerald-900/90 dark:border-emerald-800 dark:text-emerald-200'
                : 'bg-red-50/95 border-red-200 text-red-800 dark:bg-red-900/90 dark:border-red-800 dark:text-red-200'
            }`}>
            {toast.type === 'success' ? <CheckCircle2 size={18} className="shrink-0" /> : <AlertCircle size={18} className="shrink-0" />}
            <span className="text-sm font-semibold">{toast.message}</span>
        </div>
    );
};

const Field = ({ label, error, children }) => (
    <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
            <label className="text-[11px] font-bold text-gray-400 dark:text-gray-300 uppercase tracking-wider">{label}</label>
            {error && <span className="text-[10px] text-red-500 font-semibold">{error}</span>}
        </div>
        {children}
    </div>
);

const inputCls = (err) =>
    `w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border ${err ? 'border-red-300 focus:border-red-400' : 'border-gray-200 dark:border-gray-700 focus:border-emerald-400'
    } rounded-xl outline-none transition-all text-sm text-gray-800 dark:text-gray-200 placeholder:text-gray-300 dark:placeholder:text-gray-600 focus:bg-white dark:focus:bg-gray-800`;

const EMPTY = { name: '', email: '', password: '', phone: '', department: 'Human Resources', position: '', dob: '', doj: '', status: 'Active', salary: '' };

const Employees = () => {
    const role = localStorage.getItem('role')?.toUpperCase() || 'EMPLOYEE';

    const [employees, setEmployees] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState('');
    const [deptFilter, setDeptFilter] = useState('All');
    const [fetching, setFetching] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(null);
    const [viewEmployee, setViewEmployee] = useState(null);
    const [formData, setFormData] = useState(EMPTY);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const triggerToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
    };

    const fetchEmployees = async () => {
        setFetching(true);
        try {
            const res = await api.get('/employees/');
           setEmployees(res.data || []);
        } catch {
            triggerToast('Failed to load employees', 'error');
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => { fetchEmployees(); }, []);

    useEffect(() => {
        let data = [...employees];
if (search) data = data.filter(e => 
  e.name?.toLowerCase().includes(search.toLowerCase()) || 
  e.email?.toLowerCase().includes(search.toLowerCase())
);          if (deptFilter !== 'All') data = data.filter(e => e.department === deptFilter);
        setFiltered(data);
    }, [employees, search, deptFilter]);

    const validate = (name, value, data = formData) => {
        let error = '';
        const today = new Date();
        if (!value && !(isEditing && name === 'password')) error = 'Required';
        if (name === 'name' && value) {
            if (!/^[A-Za-z\s]+$/.test(value)) error = 'Only alphabets allowed';
            else if (value.length < 3) error = 'Min 3 characters';
        }
        if (name === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email';
        if (name === 'phone' && value && !/^\d{10}$/.test(value)) error = 'Must be 10 digits';
        if (name === 'password' && value && !isEditing && value.length < 6) error = 'Min 6 characters';
        if (name === 'position' && value?.trim() === '') error = 'Required';
        if (name === 'salary' && value) {
            if (!/^\d+$/.test(value)) error = 'Only numbers allowed';
            else if (parseInt(value) < 0) error = 'Must be positive';
        }
        if (name === 'dob' && value) {
            const dob = new Date(value);
            if (dob >= today) error = 'DOB must be past';
            else if (today.getFullYear() - dob.getFullYear() < 18) error = 'Must be 18+';
        }
        if (name === 'doj' && value) {
            const doj = new Date(value);
            if (doj > today) error = 'Future not allowed';
            if (data.dob && doj <= new Date(data.dob)) error = 'Must be after DOB';
        }
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleChange = (e) => {
        let { name, value } = e.target;
        if (name === 'name') value = value.replace(/[^A-Za-z\s]/g, '');
        if (name === 'phone') value = value.replace(/\D/g, '').slice(0, 10);
        if (name === 'salary') value = value.replace(/\D/g, '');
        const updated = { ...formData, [name]: value };
        setFormData(updated);
        validate(name, value, updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (Object.values(errors).some(err => err)) return;
        setLoading(true);
        try {
            if (isEditing) {
               await api.put(`/employees/${isEditing}`, {
  ...formData,
  designation: formData.position,
  salary: parseInt(formData.salary) || 0,
});
                triggerToast('Employee updated successfully!');
            } else {
await api.post('/employees/', {
  ...formData,
  designation: formData.position,
  salary: parseInt(formData.salary) || 0,
});                triggerToast('Employee created successfully!');
            }
            await fetchEmployees();
            closeModal();
        } catch (err) {
            triggerToast(err.response?.data?.message || 'Something went wrong', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this employee? This cannot be undone.')) return;
        try {
            await api.delete(`/employees/${id}`);
            triggerToast('Employee removed', 'error');
            await fetchEmployees();
        } catch {
            triggerToast('Delete failed', 'error');
        }
    };

    const closeModal = () => {
        setShowModal(false); setIsEditing(null); setErrors({});
        setShowPassword(false); setFormData(EMPTY);
    };

    const openEdit = (emp) => {
        setFormData({
            name: emp.name || '', email: emp.email || '', password: '',
            phone: emp.phone || '', department: emp.department || 'Human Resources',
            position: emp.position || '', status: emp.status || 'Active',
            salary: emp.salary || '',
            dob: emp.dob ? emp.dob.split('T')[0] : '',
            doj: emp.doj ? emp.doj.split('T')[0] : '',
        });
        setIsEditing(emp._id);
        setShowModal(true);
    };

    const totalActive = employees.filter(e => e.status !== 'Inactive').length;
    const deptCount = [...new Set(employees.map(e => e.department).filter(Boolean))].length;

    return (
        <div className="space-y-6">
            <Toast toast={toast} />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Employee Management</h1>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">Manage your team members and their information</p>
                </div>
                {role === 'HR' && (
                    <button onClick={() => setShowModal(true)}
                        className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-emerald-100 dark:shadow-none transition-all">
                        <UserPlus size={16} /> Add Employee
                    </button>
                )}
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard title="Total Employees" value={employees.length} icon={Users}
                    colorClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" />
                <StatCard title="Active" value={totalActive} icon={CheckCircle2}
                    colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" />
                <StatCard title="Departments" value={deptCount} icon={Building2}
                    colorClass="bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400" />
                <StatCard title="Inactive" value={employees.length - totalActive} icon={AlertCircle}
                    colorClass="bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400" />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-500" />
                    <input type="text" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:border-emerald-400 dark:text-gray-200 transition-all" />
                </div>
                <div className="relative">
                    <Filter size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-500" />
                    <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
                        className="pl-9 pr-8 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:border-emerald-400 appearance-none cursor-pointer text-gray-600 dark:text-gray-300">
                        <option value="All">All Departments</option>
                        {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                    </select>
                    <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-500 pointer-events-none" />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                {fetching ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-300 dark:text-gray-600">
                        <Users size={40} strokeWidth={1.5} />
                        <p className="mt-3 font-semibold text-gray-400 dark:text-gray-500">No employees found</p>
                        <p className="text-sm mt-1">{search || deptFilter !== 'All' ? 'Try changing your filters' : "Click 'Add Employee' to get started"}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-900/50">
                                    {['Employee', 'Department', 'Phone', 'Joining Date', 'Status', 'Actions'].map(h => (
                                        <th key={h} className="px-6 py-3.5 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                {filtered.map(emp => (
                                    <tr key={emp._id} className="hover:bg-gray-50/60 dark:hover:bg-gray-900/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${getAvatarColor(emp.name)}`}>
                                                    {emp.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm leading-none">{emp.name}</p>
                                                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">{emp.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 font-medium">{emp.department || '—'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-500">{emp.phone || emp.phone || '—'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-500">{(emp.doj || emp.doj)
  ? new Date(emp.doj).toLocaleDateString()
  : '—'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2.5 py-1 rounded-lg text-[11px] font-bold ${emp.status !== 'Inactive'
                                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                                                    : 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300'
                                                }`}>{emp.status || 'Active'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => setViewEmployee(emp)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all" title="View">
                                                    <Eye size={15} />
                                                </button>
                                                {role === 'HR' && <>
                                                    <button onClick={() => openEdit(emp)} className="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all" title="Edit">
                                                        <Pencil size={15} />
                                                    </button>
                                                    <button onClick={() => handleDelete(emp._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all" title="Delete">
                                                        <Trash2 size={15} />
                                                    </button>
                                                </>}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {filtered.length > 0 && (
                    <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30">
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            Showing <span className="font-semibold text-gray-600 dark:text-gray-300">{filtered.length}</span> of <span className="font-semibold text-gray-600 dark:text-gray-300">{employees.length}</span> employees
                        </p>
                    </div>
                )}
            </div>

            {/* ── View Modal ── */}
            {viewEmployee && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border dark:border-gray-700">
                        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 text-white relative">
                            <button onClick={() => setViewEmployee(null)} className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-all">
                                <X size={16} />
                            </button>
                            {(() => {
                                const source = viewEmployee.userId && typeof viewEmployee.userId === 'object' ? viewEmployee.userId : viewEmployee;
                                const displayName = source?.name || viewEmployee.name || 'Unknown';
                                return (
                                    <>
                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold mb-3 ${getAvatarColor(displayName)} border-4 border-white/30`}>
                                            {displayName?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                        <h3 className="text-xl font-bold">{displayName}</h3>
                                        <p className="text-emerald-100 text-sm">{viewEmployee.position || viewEmployee.department || 'No Department'}</p>
                                        <span className={`inline-flex mt-2 px-3 py-1 rounded-full text-xs font-bold ${viewEmployee.status !== 'Inactive' ? 'bg-white/20 text-white' : 'bg-red-200/30 text-red-100'}`}>
                                            {viewEmployee.status || 'Active'}
                                        </span>
                                    </>
                                );
                            })()}
                        </div>
                        <div className="p-6 space-y-3">
                            {(() => {
                                const source = viewEmployee.userId && typeof viewEmployee.userId === 'object' ? viewEmployee.userId : viewEmployee;
                                return [
                                    { icon: Mail, label: 'Email', value: source?.email || viewEmployee?.email || '—' },
                                    { icon: Phone, label: 'Phone', value: source?.phone || viewEmployee?.phone || '—' },
                                    { icon: Building2, label: 'Department', value: viewEmployee?.department || '—' },
                                    { icon: Calendar, label: 'Date of Birth', value: source?.dob ? new Date(source.dob).toLocaleDateString('en-IN') : viewEmployee?.dob ? new Date(viewEmployee.dob).toLocaleDateString('en-IN') : '—' },
                                    { icon: Calendar, label: 'Joining Date', value: source?.doj ? new Date(source.doj).toLocaleDateString('en-IN') : viewEmployee?.doj ? new Date(viewEmployee.doj).toLocaleDateString('en-IN') : '—' },
                                ].map(({ icon, label, value }) => {
                                    const ItemIcon = icon;
                                    return (
                                    <div key={label} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                        <div className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                                            <ItemIcon size={14} className="text-gray-400 dark:text-gray-500" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase">{label}</p>
                                            <p className="text-sm text-gray-700 dark:text-gray-200 font-medium">{value}</p>
                                        </div>
                                    </div>
                                )});
                            })()}
                        </div>
                        <div className="px-6 pb-6 flex gap-3">
                            <button onClick={() => setViewEmployee(null)} className="flex-1 py-3 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-xl font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">Close</button>
                            {role === 'HR' && (
                                <button onClick={() => { setViewEmployee(null); openEdit(viewEmployee); }}
                                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition-all">Edit Employee</button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Create / Edit Modal ── */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto border dark:border-gray-700">
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{isEditing ? 'Edit Employee' : 'Add New Employee'}</h3>
                                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">{isEditing ? 'Update employee information' : 'Fill in the details to create an account'}</p>
                                </div>
                                <button onClick={closeModal} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl text-gray-400 dark:text-gray-500 transition-all">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                    <Field label="Full Name" error={errors.name}>
                                        <input required name="name" type="text" value={formData.name} onChange={handleChange} placeholder="John Doe" className={inputCls(errors.name)} />
                                    </Field>

                                    <Field label="Work Email" error={errors.email}>
                                        <input required name="email" type="email" value={formData.email} onChange={handleChange} placeholder="john@company.com" className={inputCls(errors.email)} />
                                    </Field>

                                    <Field label="Phone Number" error={errors.phone}>
                                        <input required name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="9876543210" className={inputCls(errors.phone)} />
                                    </Field>

                                    <Field label="Department">
                                        <div className="relative">
                                            <select name="department" value={formData.department} onChange={handleChange}
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:border-emerald-400 appearance-none cursor-pointer text-gray-800 dark:text-gray-200">
                                                {DEPARTMENTS.map(d => <option key={d} className="bg-white dark:bg-gray-800">{d}</option>)}
                                            </select>
                                            <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        </div>
                                    </Field>

                                    <Field label="Position" error={errors.position}>
                                        <input required name="position" type="text" value={formData.position} onChange={handleChange} placeholder="Software Developer" className={inputCls(errors.position)} />
                                    </Field>

                                    <Field label="Salary (Monthly)" error={errors.salary}>
                                        <input required name="salary" type="text" value={formData.salary} onChange={handleChange} placeholder="50000" className={inputCls(errors.salary)} />
                                    </Field>

                                    <Field label="Date of Birth" error={errors.dob}>
                                        <input required name="dob" type="date" value={formData.dob} max={new Date().toISOString().split('T')[0]} onChange={handleChange} className={inputCls(errors.dob)} />
                                    </Field>

                                    <Field label="Date of Joining" error={errors.doj}>
                                        <input required name="doj" type="date" value={formData.doj} min={formData.dob || ''} max={new Date().toISOString().split('T')[0]} onChange={handleChange} className={inputCls(errors.doj)} />
                                    </Field>

                                    <Field label="Status">
                                        <div className="relative">
                                            <select name="status" value={formData.status} onChange={handleChange}
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:border-emerald-400 appearance-none cursor-pointer text-gray-800 dark:text-gray-200">
                                                <option className="bg-white dark:bg-gray-800">Active</option>
                                                <option className="bg-white dark:bg-gray-800">Inactive</option>
                                            </select>
                                            <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        </div>
                                    </Field>
                                </div>

                                {!isEditing && (
                                    <Field label="Login Password" error={errors.password}>
                                        <div className="relative">
                                            <input required name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange} placeholder="Min. 6 characters" className={inputCls(errors.password)} />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                            </button>
                                        </div>
                                    </Field>
                                )}

                                <div className="border-t border-gray-100 dark:border-gray-700 pt-4 flex gap-3">
                                    <button type="button" onClick={closeModal}
                                        className="flex-1 py-3 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-xl font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={loading || Object.values(errors).some(e => e)}
                                        className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm shadow-lg shadow-emerald-100 dark:shadow-none transition-all active:scale-95">
                                        {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Employee'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Employees;
