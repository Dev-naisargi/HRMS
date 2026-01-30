import { Link } from "react-router-dom";
import { UserGroupIcon } from "@heroicons/react/24/solid";

function Navbar() {
  return (
    <nav className="h-16 bg-white text-black flex items-center px-8 shadow">
      <div className="flex items-center gap-2 w-1/4">
        <div className="bg-[#0066cc] p-2 rounded-full">
          <UserGroupIcon className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold">
          <span className="text-black">HR</span>
          <span className="text-[#0066cc]">MS</span>
        </span>
      </div>

      <ul className="flex justify-center gap-8 w-2/4 font-medium">
        <li><Link to="/dashboard" className="hover:text-[#0066cc]">Dashboard</Link></li>
        <li><Link to="/employees" className="hover:text-[#0066cc]">Employees</Link></li>
        <li><Link to="/attendance" className="hover:text-[#0066cc]">Attendance</Link></li>
        <li><Link to="/payroll" className="hover:text-[#0066cc]">Payroll</Link></li>
        <li><Link to="/reports" className="hover:text-[#0066cc]">Reports</Link></li>
      </ul>

     <div className="flex justify-end w-1/4 gap-4">
        <Link
          to="/signup"
          className="border border-[#0066cc] text-[#0066cc] px-4 py-2 rounded-md font-semibold hover:bg-[#0066cc] hover:text-white transition"
        >
          Sign Up
        </Link>
     
        <Link
          to="/login"
          className="border border-[#0066cc] text-[#0066cc] px-4 py-2 rounded-md font-semibold hover:bg-[#0066cc] hover:text-white transition"
        >
         Login
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
