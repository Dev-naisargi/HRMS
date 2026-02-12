import React from "react";
import { 
  LayoutDashboard, 
  UserCircle, 
  Users, 
  CalendarCheck, 
  FileSpreadsheet 
} from "lucide-react";


const Sidebar = ({ activeTab, setActiveTab }) => {
  return (
    <div className="w-64 bg-white border-r min-h-screen p-6 shadow-sm">
     
      <h2 className="text-xl font-bold text-emerald-600 mb-8 tracking-tight">
        <div className="text-center">Admin</div>  
      </h2>

      <nav className="space-y-2">
        
        <div 
          onClick={() => setActiveTab("dashboard")}
          className={`flex items-center gap-3 cursor-pointer p-3 rounded-xl transition-all font-medium ${
            activeTab === "dashboard" 
              ? "bg-emerald-50 text-emerald-700 font-bold shadow-sm" 
              : "hover:bg-gray-50 hover:text-emerald-600 text-gray-500"
          }`}
        >
          <LayoutDashboard size={18} />
          Dashboard
        </div>

   
        <div 
          onClick={() => setActiveTab("hr")}
          className={`flex items-center gap-3 cursor-pointer p-3 rounded-xl transition-all font-medium ${
            activeTab === "hr" 
              ? "bg-emerald-50 text-emerald-700 font-bold shadow-sm" 
              : "hover:bg-gray-50 hover:text-emerald-600 text-gray-500"
          }`}
        >
          <UserCircle size={18} />
          HR
        </div>

        
        <div 
          onClick={() => setActiveTab("employee")}
          className={`flex items-center gap-3 cursor-pointer p-3 rounded-xl transition-all font-medium ${
            activeTab === "employee" 
              ? "bg-emerald-50 text-emerald-700 font-bold shadow-sm" 
              : "hover:bg-gray-50 hover:text-emerald-600 text-gray-500"
          }`}
        >
          <Users size={18} />
          Employee
        </div>

        <div 
          onClick={() => setActiveTab("attendance")}
          className={`flex items-center gap-3 cursor-pointer p-3 rounded-xl transition-all font-medium ${
            activeTab === "attendance" 
              ? "bg-emerald-50 text-emerald-700 font-bold shadow-sm" 
              : "hover:bg-gray-50 hover:text-emerald-600 text-gray-500"
          }`}
        >
          <CalendarCheck size={18} />
          Attendance
        </div>

       
        <div 
          onClick={() => setActiveTab("leaves")}
          className={`flex items-center gap-3 cursor-pointer p-3 rounded-xl transition-all font-medium ${
            activeTab === "leaves" 
              ? "bg-emerald-50 text-emerald-700 font-bold shadow-sm" 
              : "hover:bg-gray-50 hover:text-emerald-600 text-gray-500"
          }`}
        >
          <FileSpreadsheet size={18} />
          Leaves
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;