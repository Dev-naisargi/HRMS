import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  // TEMP role (frontend only)
  const role = "admin"; // admin | hr | employee

  const location = useLocation();
  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sky-800 text-white">

      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-slate-700">
        <Link
          to="/dashboard/admin"
          className="text-xl font-bold text-blue-400"
        >
          HRMS
        </Link>
      </div>

      {/* Menu */}
      <nav className="mt-6 px-4 space-y-2">

        <Link
          to="/dashboard/admin"
          className={`block px-4 py-2 rounded ${
            isActive("/dashboard")
              ? "bg-blue-600"
              : "hover:bg-slate-700"
          }`}
        >
          Dashboard
        </Link>

        {(role === "admin" || role === "hr") && (
          <Link
            to="/users"
            className={`block px-4 py-2 rounded ${
              isActive("/users")
                ? "bg-blue-600"
                : "hover:bg-slate-700"
            }`}
          >
            Users
          </Link>
        )}

        <Link
          to="/employees"
          className={`block px-4 py-2 rounded ${
            isActive("/employees")
              ? "bg-blue-600"
              : "hover:bg-slate-700"
          }`}
        >
          Employees
        </Link>

        <Link
          to="/attendance"
          className={`block px-4 py-2 rounded ${
            isActive("/attendance")
              ? "bg-blue-600"
              : "hover:bg-slate-700"
          }`}
        >
          Attendance
        </Link>

        <Link
          to="/leaves"
          className={`block px-4 py-2 rounded ${
            isActive("/leaves")
              ? "bg-blue-600"
              : "hover:bg-slate-700"
          }`}
        >
          Leaves
        </Link>
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 w-full border-t border-slate-700 p-4 text-sm text-gray-400">
        Role: <span className="capitalize">{role}</span>
      </div>

    </aside>
  );
};

export default Sidebar;
