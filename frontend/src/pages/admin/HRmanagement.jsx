import React, { useState } from "react";
import { 
  UserPlus, Pencil, Trash2, X, Eye, 
  CheckCircle2, AlertCircle, Mail, Phone, 
  Calendar, Briefcase, MapPin, User, Heart, Droplets, Lock
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
      gender: "Male",
      maritalStatus: "Single",
      bloodGroup: "O+",
      address: "123, Skyline Apartments, Mumbai",
      password: "••••••••",
      status: "Active" 
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(null);
  const [isViewing, setIsViewing] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", dept: "Human Resources", 
    dob: "", doj: "", gender: "Male", maritalStatus: "Single",
    bloodGroup: "A+", address: "", password: "" 
  });

  const triggerToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      setHrs(hrs.map(hr => hr.id === isEditing ? { ...formData, id: isEditing } : hr));
      triggerToast("Record Updated Successfully");
    } else {
      setHrs([{ ...formData, id: Date.now(), status: "Active" }, ...hrs]);
      triggerToast("HR Created Successfully");
    }
    closeModal();
  };

  // FIXED: Added toast trigger here
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this HR record?")) {
      setHrs(hrs.filter(h => h.id !== id));
      triggerToast("HR Record Deleted", "error");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEditing(null);
    setIsViewing(false);
    setFormData({ 
      name: "", email: "", phone: "", dept: "Human Resources", 
      dob: "", doj: "", gender: "Male", maritalStatus: "Single",
      bloodGroup: "A+", address: "", password: "" 
    });
  };

  return (
    <div className="relative space-y-6 p-6">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-6 py-3 rounded-xl shadow-2xl border animate-in slide-in-from-top-4 duration-300 ${toast.type === "success" ? "bg-emerald-50 text-emerald-800 border-emerald-100" : "bg-red-50 text-red-800 border-red-100"}`}>
          {toast.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span className="font-bold text-xs">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center px-2">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">HR Management</h2>
          <p className="text-xs text-gray-500">Manage company HR records and system credentials.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100">
          <UserPlus size={16} /> Create HR
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">HR Name</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Department</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {hrs.map((hr) => (
              <tr key={hr.id} className="hover:bg-gray-50/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center font-bold text-sm">{hr.name.charAt(0)}</div>
                    <p className="font-bold text-gray-700 text-sm">{hr.name}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-semibold text-gray-500">{hr.dept}</span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                    {hr.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-[11px] text-gray-500">
                    <p className="font-medium text-gray-700">{hr.email}</p>
                    <p>{hr.phone}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => { setFormData(hr); setIsViewing(true); setShowModal(true); }} className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="View Profile"><Eye size={16} /></button>
                    <button onClick={() => { setFormData(hr); setIsEditing(hr.id); setShowModal(true); }} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit Profile"><Pencil size={16} /></button>
                    <button onClick={() => handleDelete(hr.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete HR"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/30 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-base font-bold text-gray-800">{isViewing ? "HR Profile" : isEditing ? "Update HR Record" : "Register HR"}</h3>
              <button onClick={closeModal} className="p-1 hover:bg-gray-200 rounded-md text-gray-400 transition-colors"><X size={18}/></button>
            </div>

            <div className="px-8 py-6 max-h-[80vh] overflow-y-auto">
              {isViewing ? (
                /* VIEW MODE */
                <div className="space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center text-lg font-bold">{formData.name.charAt(0)}</div>
                    <div>
                        <h4 className="text-sm font-bold text-gray-800">{formData.name}</h4>
                        <p className="text-emerald-600 text-[9px] font-black uppercase tracking-widest">{formData.dept} Department</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-8 gap-y-4 pt-2">
                    <div className="space-y-0.5">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter flex items-center gap-1.5"><Mail size={12}/> Email</p>
                        <p className="text-xs font-semibold text-gray-700">{formData.email}</p>
                    </div>
                    <div className="space-y-0.5">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter flex items-center gap-1.5"><Phone size={12}/> Phone</p>
                        <p className="text-xs font-semibold text-gray-700">{formData.phone}</p>
                    </div>
                    <div className="space-y-0.5">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter flex items-center gap-1.5"><Heart size={12}/> Marital Status</p>
                        <p className="text-xs font-semibold text-gray-700">{formData.maritalStatus}</p>
                    </div>
                    <div className="space-y-0.5">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter flex items-center gap-1.5"><Droplets size={12}/> Blood Group</p>
                        <p className="text-xs font-semibold text-gray-700">{formData.bloodGroup}</p>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1.5"><MapPin size={12}/> Permanent Address</p>
                      <p className="text-xs text-gray-600 leading-relaxed">{formData.address || "Address details not provided."}</p>
                  </div>
                </div>
              ) : (
                /* FORM MODE */
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">HR Name</label>
                      <input required name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-emerald-500 text-xs transition-all" placeholder="Enter full name" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Email</label>
                      <input required name="email" type="email" value={formData.email} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-emerald-500 text-xs transition-all" placeholder="email@company.com" />
                    </div>
                    
                    <div className="col-span-full space-y-1">
                      <label className="text-[10px] font-bold text-emerald-600 uppercase ml-1 flex items-center gap-2"><Lock size={12}/> Login Password</label>
                      <input required={!isEditing} name="password" type="text" value={formData.password} onChange={handleChange} className="w-full px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-lg outline-none focus:border-emerald-500 text-xs font-mono" placeholder="Set password for dashboard access" />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Department</label>
                      <select name="dept" value={formData.dept} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-emerald-500 text-xs cursor-pointer">
                        <option>Human Resources</option><option>IT</option><option>Sales</option><option>Finance</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Marital Status</label>
                      <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-emerald-500 text-xs cursor-pointer">
                        <option>Single</option><option>Married</option><option>Divorced</option><option>Widowed</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Birth Date</label>
                      <input required type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-emerald-500 text-xs" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Joining Date</label>
                      <input required type="date" name="doj" value={formData.doj} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-emerald-500 text-xs" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Blood Group</label>
                        <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-emerald-500 text-xs cursor-pointer">
                            <option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>O+</option><option>O-</option><option>AB+</option><option>AB-</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Phone Number</label>
                        <input required name="phone" value={formData.phone} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-emerald-500 text-xs" />
                    </div>
                    <div className="col-span-full space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Permanent Address</label>
                      <textarea name="address" rows="2" value={formData.address} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-emerald-500 text-xs resize-none" placeholder="House no, Street, City, State..."></textarea>
                    </div>
                  </div>
                  <div className="pt-4">
                    <button className="w-full py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 uppercase tracking-widest">
                      {isEditing ? "Save Changes" : "Create HR"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRmanagement;