import React, { useState, useEffect } from "react";
import {
  UserPlus,
  Pencil,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import api from "../../utils/api"; // your axios instance

const HRmanagement = () => {
  const [hrs, setHrs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    dob: "",
    doj: "",
    password: "",
  });

  // -------------------------
  // Toast Helper
  // -------------------------
  const triggerToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000);
  };

  // -------------------------
  // Fetch all HRs from backend
  // -------------------------
  const fetchHRs = async () => {
    try {
      const res = await api.get("/admin/hrs");
      setHrs(res.data.hrs);
    } catch (err) {
      triggerToast(err.response?.data?.message || "Failed to fetch HRs", "error");
    }
  };

  useEffect(() => {
    fetchHRs();
  }, []);

  // -------------------------
  // Validation
  // -------------------------
  const validateField = (name, value, data = formData) => {
  let error = "";

  const nameRegex = /^[A-Za-z\s]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\d{10}$/;
  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/;

  const today = new Date();
  const dobDate = data.dob ? new Date(data.dob) : null;
  const dojDate = data.doj ? new Date(data.doj) : null;

  // REQUIRED
  if (!value) {
    error = "Required";
  }

  // NAME
  if (name === "name" && value) {
    if (!nameRegex.test(value)) error = "Only letters allowed";
    else if (value.length < 3) error = "Min 3 characters";
    else if (value.length > 50) error = "Too long";
  }

  // EMAIL
  if (name === "email" && value) {
    if (!emailRegex.test(value)) error = "Invalid email";
  }

  // PHONE
  if (name === "phone" && value) {
    if (!phoneRegex.test(value)) error = "Must be 10 digits";
  }

  // PASSWORD
  if (name === "password" && value && !isEditing) {
    if (!passwordRegex.test(value)) {
      error = "Weak password";
    }
  }

  // DOB VALIDATION
  if (name === "dob" && value) {
    const dob = new Date(value);

    if (dob >= today) {
      error = "DOB must be in past";
    } else {
      const age = today.getFullYear() - dob.getFullYear();
      if (age < 18) error = "Must be 18+";
    }
  }

  // DOJ VALIDATION
  if (name === "doj" && value) {
    const doj = new Date(value);

    if (doj > today) {
      error = "DOJ cannot be future";
    }

    if (data.dob) {
      const dob = new Date(data.dob);
      if (doj <= dob) {
        error = "DOJ must be after DOB";
      }
    }
  }

  setErrors((prev) => ({ ...prev, [name]: error }));
};
  const handleChange = (e) => {
  const { name, value } = e.target;

  let newValue = value;

  if (name === "name") {
    newValue = value.replace(/[^A-Za-z\s]/g, "");
  }

  const updated = { ...formData, [name]: newValue };
  setFormData(updated);
  validateField(name, newValue, updated);
};

  // -------------------------
  // Create or Update HR
  // -------------------------
  const handleSubmit = async (e) => {
  e.preventDefault();

  let newErrors = {};

  Object.keys(formData).forEach((key) => {
    if (!formData[key]) {
      newErrors[key] = "Required";
    }
  });

  setErrors(newErrors);

  if (Object.keys(newErrors).length > 0) {
    triggerToast("Please fix all fields", "error");
    return;
  }

  if (Object.values(errors).some((err) => err !== "")) return;
    setLoading(true);
    try {
      if (isEditing) {
        // Update HR
        await api.put(`/admin/hrs/${isEditing}`, formData);
        triggerToast("HR record updated successfully!");
      } else {
        // Create HR — calls your backend adminController.createHR
        await api.post("/admin/create-hr", {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          department: formData.department,
          dob: formData.dob,
          doj: formData.doj,
        });
        triggerToast("New HR account created!");
      }
      await fetchHRs(); // refresh list from DB
      closeModal();
    } catch (err) {
      triggerToast(err.response?.data?.message || "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // Delete HR
  // -------------------------
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this HR?")) return;
    try {
      await api.delete(`/admin/hrs/${id}`);
      triggerToast("HR deleted successfully", "error");
      await fetchHRs();
    } catch (err) {
      triggerToast(err.response?.data?.message || "Delete failed", "error");
    }
  };

  // -------------------------
  // Close Modal
  // -------------------------
  const closeModal = () => {
    setShowModal(false);
    setIsEditing(null);
    setErrors({});
    setFormData({
      name: "",
      email: "",
      phone: "",
      department: "",
      dob: "",
      doj: "",
      password: "",
    });
  };

  return (
    <div className="relative space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Toast */}
      {toast.show && (
        <div
          className={`fixed top-10 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border animate-in slide-in-from-top-full duration-300 ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-100 text-emerald-800"
              : "bg-red-50 border-red-100 text-red-800"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <span className="font-bold text-sm">{toast.message}</span>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
         <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">
            HR Management
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage and register company HR officers.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
        className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-md">
          <UserPlus size={18} /> Create HR
        </button>
      </div>

      {/* HR Table */}
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-[2.5rem] shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
            <tr>
              <th className="px-8 py-4 text-[11px] font-bold text-gray-400 dark:text-gray-300 uppercase tracking-widest">HR Name</th>
              <th className="px-8 py-4 text-[11px] font-bold text-gray-400 dark:text-gray-300 uppercase tracking-widest">Department</th>
              <th className="px-8 py-4 text-[11px] font-bold text-gray-400 dark:text-gray-300 uppercase tracking-widest">Joining Date</th>
              <th className="px-8 py-4 text-[11px] font-bold text-gray-400 dark:text-gray-300 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {hrs.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-10 text-gray-400 font-medium">
                  No HR accounts found. Create one!
                </td>
              </tr>
            ) : (
              hrs.map((hr) => (
                <tr key={hr._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/40 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-xl flex items-center justify-center font-bold text-sm">
                        {hr.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 dark:text-gray-100 leading-none">{hr.name}</p>
                        <p className="text-[11px] text-gray-800 dark:text-gray-100 mt-1">{hr.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-medium text-gray-600 dark:text-gray-300">{hr.department || "—"}</td>
                  <td className="px-8 py-5 text-sm text-gray-500 dark:text-gray-400 font-medium">{hr.doj ? new Date(hr.doj).toLocaleDateString() : "—"}</td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                     <button
  onClick={() => {
    setFormData({
      name: hr.name || "",
      email: hr.email || "",
      phone: hr.phone || "",
      department: hr.department || "",
      dob: hr.dob || "",
      doj: hr.doj || "",
      password: "",
    });

    setIsEditing(hr._id);
    setShowModal(true);
  }}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(hr._id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 md:p-10">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {isEditing ? "Edit HR Record" : "New HR Registration"}
                </h3>
                <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 dark:text-gray-300">
                  <X size={24} />
                </button>
              </div>

           <form onSubmit={handleSubmit} className="space-y-6">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

    {/* Name */}
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center px-1">
        <label className="text-[11px] font-bold text-gray-400 dark:text-gray-300 uppercase">
          Full Name
        </label>
        {errors.name && (
          <span className="text-[10px] text-red-500 font-bold uppercase">
            {errors.name}
          </span>
        )}
      </div>

      <input
        required
        name="name"
        type="text"
        value={formData.name}
        className={`w-full p-3.5 bg-gray-50 dark:bg-gray-700 border ${
          errors.name ? "border-red-400" : "border-gray-100 dark:border-gray-600"
        } text-gray-800 dark:text-white rounded-2xl outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-700 transition-all text-sm`}
        onChange={handleChange}
      />
    </div>

    {/* Email */}
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center px-1">
        <label className="text-[11px] font-bold text-gray-400 dark:text-gray-300 uppercase">
          Work Email
        </label>
        {errors.email && (
          <span className="text-[10px] text-red-500 font-bold uppercase">
            {errors.email}
          </span>
        )}
      </div>

      <input
        required
        name="email"
        type="email"
        value={formData.email}
        className={`w-full p-3.5 bg-gray-50 dark:bg-gray-700 border ${
          errors.email ? "border-red-400" : "border-gray-100 dark:border-gray-600"
        } text-gray-800 dark:text-white rounded-2xl outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-700 transition-all text-sm`}
        onChange={handleChange}
      />
    </div>

    {/* Phone */}
   <div className="flex flex-col gap-1.5">
  <div className="flex justify-between items-center px-1">
    <label className="text-[11px] font-bold text-gray-400 dark:text-gray-300 uppercase">
      Phone Number
    </label>
    {errors.phone && (
      <span className="text-[10px] text-red-500 font-bold uppercase">
        {errors.phone}
      </span>
    )}
  </div>

  <input
    required
    name="phone"
    type="tel"
    value={formData.phone}
    className={`w-full p-3.5 bg-gray-50 dark:bg-gray-700 border ${
      errors.phone ? "border-red-400" : "border-gray-100 dark:border-gray-600"
    } text-gray-800 dark:text-white rounded-2xl outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-700 transition-all text-sm`}
    
    // ✅ STRICT PHONE CONTROL
    onChange={(e) => {
      let value = e.target.value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({ ...prev, phone: value }));
      validateField("phone", value, { ...formData, phone: value });
    }}

    onKeyDown={(e) => {
      if (
        formData.phone.length >= 10 &&
        e.key !== "Backspace" &&
        e.key !== "Delete"
      ) {
        e.preventDefault();
      }
    }}
  />
</div>

    {/* Department */}
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold text-gray-400 dark:text-gray-300 uppercase ml-1">
        Department
      </label>

      <select
  name="department"
  value={formData.department}
  className="w-full p-3.5 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 text-gray-800 dark:text-white rounded-2xl outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-700 transition-all text-sm cursor-pointer"
  onChange={handleChange}
>
  <option className="bg-white dark:bg-gray-700 text-gray-800 dark:text-white" value="Human Resources">
    Human Resources
  </option>
  <option className="bg-white dark:bg-gray-700 text-gray-800 dark:text-white" value="IT">
    IT
  </option>
  <option className="bg-white dark:bg-gray-700 text-gray-800 dark:text-white" value="Sales">
    Sales
  </option>
  <option className="bg-white dark:bg-gray-700 text-gray-800 dark:text-white" value="Account">
    Account
  </option>
  <option className="bg-white dark:bg-gray-700 text-gray-800 dark:text-white" value="Marketing">
    Marketing
  </option>
  <option className="bg-white dark:bg-gray-700 text-gray-800 dark:text-white" value="Customer Support">
    Customer Support
  </option>
</select>
    </div>

    {/* DOB */}
   <div className="flex flex-col gap-1.5">
  <label className="text-[11px] font-bold text-gray-400 dark:text-gray-300 uppercase ml-1">
    Date of Birth
  </label>

  <input
    required
    name="dob"
    type="date"
    value={formData.dob}

    // ✅ DISABLE FUTURE DATES
    max={new Date().toISOString().split("T")[0]}

    className="w-full p-3.5 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 text-gray-800 dark:text-white rounded-2xl outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-700 transition-all text-sm"
    onChange={handleChange}
  />
</div>

{/* DOJ */}
<div className="flex flex-col gap-1.5">
  <label className="text-[11px] font-bold text-gray-400 dark:text-gray-300 uppercase ml-1">
    Joining Date
  </label>

  <input
    required
    name="doj"
    type="date"
    value={formData.doj}

    // ✅ MUST BE AFTER DOB
    min={formData.dob || ""}

    // ✅ NO FUTURE DATE
    max={new Date().toISOString().split("T")[0]}

    className="w-full p-3.5 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 text-gray-800 dark:text-white rounded-2xl outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-700 transition-all text-sm"
    onChange={handleChange}
  />
</div>

  </div>
               {/* Password */}
{!isEditing && (
  <div className="flex flex-col gap-1.5">
    <div className="flex justify-between items-center px-1">
      <label className="text-[11px] font-bold text-gray-400 dark:text-gray-300 uppercase">
        Login Password
      </label>

      {errors.password && (
        <span className="text-[10px] text-red-500 font-bold uppercase">
          {errors.password}
        </span>
      )}
    </div>

    <input
      required
      name="password"
      type="password"
      value={formData.password}
      className={`w-full p-3.5 bg-gray-50 dark:bg-gray-700 border ${
        errors.password
          ? "border-red-400"
          : "border-gray-100 dark:border-gray-600"
      } text-gray-800 dark:text-white rounded-2xl outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-700 transition-all text-sm`}
      onChange={handleChange}
    />
  </div>
)}

                <button
                  disabled={loading || Object.values(errors).some((err) => err !== "")}
                 className="w-full py-4 bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-sm shadow-md hover:bg-emerald-700 transition-all mt-4 active:scale-95">
                                  {loading ? "Please wait..." : isEditing ? "Update HR Details" : "Create HR Account"}
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