import React from "react";

const Navbar = () => {
  return (
    <div className="h-16 bg-white border-b flex items-center justify-between px-8">
      <h1 className="font-semibold text-gray-700">
        Company Dashboard
      </h1>

      <button
        onClick={() => {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }}
        className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm"
      >
        Logout
      </button>
    </div>
  );
};

export default Navbar;
