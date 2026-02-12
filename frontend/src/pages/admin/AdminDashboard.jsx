import React from "react";
import Sidebar from "../../components/dashboard/Sidebar";
import Navbar from "../../components/dashboard/Navbar";
import HRmanagement from "./HRmanagement"; // Ensure the filename case matches exactly
import { useState } from "react";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar gets the state and setter */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <div className="p-8 space-y-8">
          
         
          {activeTab === "dashboard" && (
            <>
              <h1 className="text-2xl font-bold text-gray-800">
                Welcome, Admin
              </h1>

            
              <div className="grid md:grid-cols-4 gap-6">
                <div className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all duration-300 ease-in-out hover:shadow-2xl hover:border-green-500 cursor-pointer">
                  <p className="text-gray-500 text-sm group-hover:text-green-600 transition">Total HR</p>
                  <h2 className="text-2xl font-bold mt-2 transition-all duration-300 group-hover:scale-110 group-hover:text-green-600">0</h2>
                </div>

                <div className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all duration-300 ease-in-out hover:shadow-2xl hover:border-blue-500 cursor-pointer">
                  <p className="text-gray-500 text-sm group-hover:text-blue-600 transition">Total Employees</p>
                  <h2 className="text-2xl font-bold mt-2 transition-all duration-300 group-hover:scale-110 group-hover:text-blue-600">0</h2>
                </div>

                <div className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all duration-300 ease-in-out hover:shadow-2xl hover:border-purple-500 cursor-pointer">
                  <p className="text-gray-500 text-sm group-hover:text-purple-600 transition">Departments</p>
                  <h2 className="text-2xl font-bold mt-2 transition-all duration-300 group-hover:scale-110 group-hover:text-purple-600">0</h2>
                </div>

                <div className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all duration-300 ease-in-out hover:shadow-2xl hover:border-red-500 cursor-pointer">
                  <p className="text-gray-500 text-sm group-hover:text-red-600 transition">Pending Leaves</p>
                  <h2 className="text-2xl font-bold mt-2 transition-all duration-300 group-hover:scale-110 group-hover:text-red-600">0</h2>
                </div>
              </div>
            </>
          )}

          
          {activeTab === "hr" && (
            <HRmanagement />
          )}

         
          {activeTab !== "dashboard" && activeTab !== "hr" && (
            <div className="p-10 text-center bg-white rounded-2xl border border-dashed text-gray-400 font-medium">
              This module ( {activeTab} ) is coming soon!
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;