import Sidebar from "../../components/Sidebar";

const AdminDashboard = () => {
  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="ml-64 flex-1 min-h-screen bg-gray-100 p-6">
        <h1 className="text-2xl font-semibold mb-6">
          Admin Dashboard
        </h1> 

        {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

  {/* Users */}
  <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-5 rounded-xl shadow-lg">
    <h3 className="text-sm opacity-90">Total Users</h3>
    <p className="text-3xl font-bold mt-2">120</p>
  </div>

  {/* Employees */}
  <div className="bg-gradient-to-r from-green-500 to-emerald-700 text-white p-5 rounded-xl shadow-lg">
    <h3 className="text-sm opacity-90">Employees</h3>
    <p className="text-3xl font-bold mt-2">85</p>
  </div>

  {/* Attendance */}
  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-5 rounded-xl shadow-lg">
    <h3 className="text-sm opacity-90">Attendance</h3>
    <p className="text-3xl font-bold mt-2">76%</p>
  </div>

  {/* Leaves */}
  <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white p-5 rounded-xl shadow-lg">
    <h3 className="text-sm opacity-90">Leaves</h3>
    <p className="text-3xl font-bold mt-2">12</p>
  </div>

</div>



        </div>

      </div>
  
  );
};

export default AdminDashboard;
