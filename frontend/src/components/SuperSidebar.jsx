import React from 'react';
import { NavLink } from 'react-router-dom';
import { Building2, FileCheck, FileText } from 'lucide-react';

const SuperSidebar = () => {
const menuItems = [

{ icon: FileCheck, label: 'Dashboard', path: '/superadmin/dashboard' },
{ icon: Building2, label: 'Companies', path: '/superadmin/companies' },


];

return ( <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-screen flex flex-col fixed left-0 top-0 z-50">


  {/* HEADER */}
  <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
    <h1 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
      <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
        S
      </div>
      Super Admin
    </h1>
  </div>

  {/* MENU */}
  <nav className="flex-1 px-3 py-4 space-y-1">

    {menuItems.map((item) => (
      <NavLink
        key={item.path}
        to={item.path}
        className={({ isActive }) =>
          `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition
          ${isActive
            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`
        }
      >
        <item.icon size={18} />
        {item.label}
      </NavLink>
    ))}

  </nav>

  {/* FOOTER */}
  <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-800 text-center">
    <p className="text-xs text-gray-400">Management Panel</p>
  </div>

</div>


);
};

export default SuperSidebar;
