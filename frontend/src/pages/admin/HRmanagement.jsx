import React, { useState, useEffect } from "react";
import { 
  UserPlus, 
  Pencil, 
  Trash2, 
  X, 
  Search,
  CheckCircle2,
  AlertCircle 
} from "lucide-react";

const HRmanagement = () => {
  const [hrs, setHrs] = useState([
    { 
      id: 1, 
      name: "Rahul Sharma", 
      email: "rahul@company.com", 
      phone: "9876543210", 
      dept: "IT", 
      dob: "1995-05-15",
      doj: "2023-01-10",
      status: "Active" 
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(null);
  const [errors, setErrors] = useState({});
  // --- Toast State ---
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dept: "Human Resources",
    dob: "",
    doj: "",
    password: ""
  });

  // --- Toast Helper ---
  const triggerToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ ...toast, show: false }), 3000);
  };

  const validateField = (name, value) => {
    let error = "";
    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) error = "Invalid email format";
    }
    if (name === "phone") {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(value)) error = "Must be 10 digits";
    }
    if (name === "name" && value.length < 3) {
      error = "Name too short";
    }
    if (name === "password" && !isEditing && value.length < 6) {
      error = "Min 6 characters";
    }

    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const hasErrors = Object.values(errors).some(err => err !== "");
    if (hasErrors) return;

    if (isEditing) {
      setHrs(hrs.map(hr => hr.id === isEditing ? { ...formData, id: isEditing } : hr));
      triggerToast("HR record updated successfully!");
    } else {
      setHrs([{ ...formData, id: Date.now(), status: "Active" }, ...hrs]);
      triggerToast("New HR account created!");
    }
    closeModal();
  };

  const handleDelete = (id) => {
    setHrs(hrs.filter(h => h.id !== id));
    triggerToast("Record deleted", "error");
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEditing(null);
    setErrors({});
    setFormData({ name: "", email: "", phone: "", dept: "Human Resources", dob: "", doj: "", password: "" });
  };

  return (
    <div className="relative space-y-6 p-6">
      {/* --- Toast UI --- */}
      {toast.show && (
        <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border animate-in slide-in-from-top-full duration-300 ${
          toast.type === "success" 
            ? "bg-emerald-50 border-emerald-100 text-emerald-800" 
            : "bg-red-50 border-red-100 text-red-800"
        }`}>
          {toast.type === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span className="font-bold text-sm">{toast.message}</span>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">HR Management</h2>
          <p className="text-sm text-gray-500">Manage and register company HR officers.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
        >
          <UserPlus size={18} /> Create HR
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-8 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">HR Name</th>
              <th className="px-8 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Department</th>
              <th className="px-8 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Joining Date</th>
              <th className="px-8 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {hrs.map((hr) => (
              <tr key={hr.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center font-bold text-sm">
                      {hr.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 leading-none">{hr.name}</p>
                      <p className="text-[11px] text-gray-400 mt-1">{hr.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5 text-sm font-medium text-gray-600">{hr.dept}</td>
                <td className="px-8 py-5 text-sm text-gray-500 font-medium">{hr.doj}</td>
                <td className="px-8 py-5 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => { setFormData(hr); setIsEditing(hr.id); setShowModal(true); }}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                    >
                      <Pencil size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(hr.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-4 transition-all">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 md:p-10">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold text-gray-800">
                  {isEditing ? "Edit HR Record" : "New HR Registration"}
                </h3>
                <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
                  <X size={24}/>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[11px] font-bold text-gray-400 uppercase">Full Name</label>
                      {errors.name && <span className="text-[10px] text-red-500 font-bold uppercase">{errors.name}</span>}
                    </div>
                    <input required name="name" type="text" value={formData.name} 
                    className={`w-full p-3.5 bg-gray-50 border ${errors.name ? 'border-red-400' : 'border-gray-100'} rounded-2xl outline-none focus:border-emerald-500 focus:bg-white transition-all text-sm`} 
                    onChange={handleChange} />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[11px] font-bold text-gray-400 uppercase">Work Email</label>
                      {errors.email && <span className="text-[10px] text-red-500 font-bold uppercase">{errors.email}</span>}
                    </div>
                    <input required name="email" type="email" value={formData.email} 
                    className={`w-full p-3.5 bg-gray-50 border ${errors.email ? 'border-red-400' : 'border-gray-100'} rounded-2xl outline-none focus:border-emerald-500 focus:bg-white transition-all text-sm`}
                    onChange={handleChange} />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[11px] font-bold text-gray-400 uppercase">Phone Number</label>
                      {errors.phone && <span className="text-[10px] text-red-500 font-bold uppercase">{errors.phone}</span>}
                    </div>
                    <input required name="phone" type="tel" value={formData.phone} 
                    className={`w-full p-3.5 bg-gray-50 border ${errors.phone ? 'border-red-400' : 'border-gray-100'} rounded-2xl outline-none focus:border-emerald-500 focus:bg-white transition-all text-sm`}
                    onChange={handleChange} />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-gray-400 uppercase ml-1">Department</label>
                    <select name="dept" value={formData.dept} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-emerald-500 focus:bg-white transition-all text-sm cursor-pointer"
                    onChange={handleChange}>
                      <option value="Human Resources">Human Resources</option>
                      <option value="IT">IT</option>
                      <option value="Sales">Sales</option>
                      <option value="Account">Account</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Customer Support">Customer Support</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-gray-400 uppercase ml-1">Date of Birth</label>
                    <input required name="dob" type="date" value={formData.dob} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-emerald-500 focus:bg-white transition-all text-sm"
                    onChange={handleChange} />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-gray-400 uppercase ml-1">Joining Date</label>
                    <input required name="doj" type="date" value={formData.doj} className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-emerald-500 focus:bg-white transition-all text-sm"
                    onChange={handleChange} />
                  </div>
                </div>

                {!isEditing && (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[11px] font-bold text-gray-400 uppercase">Login Password</label>
                      {errors.password && <span className="text-[10px] text-red-500 font-bold uppercase">{errors.password}</span>}
                    </div>
                    <input required name="password" type="password" value={formData.password} 
                    className={`w-full p-3.5 bg-gray-50 border ${errors.password ? 'border-red-400' : 'border-gray-100'} rounded-2xl outline-none focus:border-emerald-500 focus:bg-white transition-all text-sm`}
                    onChange={handleChange} />
                  </div>
                )}

                <button 
                  disabled={Object.values(errors).some(err => err !== "")}
                  className="w-full py-4 bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-sm shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all mt-4 active:scale-95"
                >
                  {isEditing ? "Update HR Details" : "Create HR Account"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRmanagement;