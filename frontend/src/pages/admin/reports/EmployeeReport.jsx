import React, { useEffect, useState } from "react";
import api from "../../../utils/api";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Users, CheckCircle2, XCircle } from "lucide-react";


const EmployeeReport = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await api.get("/employees");
      setEmployees(res.data.employees || []);
    } catch (err) {
      console.error("Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  /*  CALCULATIONS */

  const totalEmployees = employees.length;

  const activeEmployees = employees.filter(
    (e) => e.status === "Active"
  ).length;

  const inactiveEmployees = employees.filter(
    (e) => e.status === "Inactive"
  ).length;
  /* EXPORT CSV */

const exportCSV = () => {
  const data = employees.map((emp) => ({
    Name: emp.name,
    Department: emp.department || "-",
    JoiningDate: emp.doj
      ? new Date(emp.doj).toLocaleDateString()
      : "-",
    Email: emp.email,
    Status: emp.status || "Active",
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");

  XLSX.writeFile(workbook, "Employee_Report.csv");
};


/* EXPORT EXCEL */

const exportExcel = () => {
  const data = employees.map((emp) => ({
    Name: emp.name,
    Department: emp.department || "-",
    JoiningDate: emp.doj
      ? new Date(emp.doj).toLocaleDateString()
      : "-",
    Email: emp.email,
    Status: emp.status || "Active",
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");

  XLSX.writeFile(workbook, "Employee_Report.xlsx");
};


/* EXPORT PDF */
const exportPDF = () => {

  const doc = new jsPDF();

  const date = new Date().toLocaleDateString();

  /* HEADER */

  doc.setFontSize(20);
  doc.text("HRMS Employee Report", 14, 20);

  doc.setFontSize(11);
  doc.text(`Generated Date: ${date}`, 14, 28);

  /* SUMMARY */

  doc.setFontSize(14);
  doc.text("Employee Summary", 14, 40);

  doc.setFontSize(11);
  doc.text(`Total Employees: ${totalEmployees}`, 14, 48);
  doc.text(`Active Employees: ${activeEmployees}`, 14, 54);
  doc.text(`Inactive Employees: ${inactiveEmployees}`, 14, 60);

  /* TABLE DATA */

  const tableData = employees.map((emp) => [
    emp.name,
    emp.department || "-",
    emp.doj ? new Date(emp.doj).toLocaleDateString() : "-",
    emp.email,
    emp.status || "Active",
  ]);

  autoTable(doc,{
  startY:70,
  head:[["Name","Department","Joining Date","Email","Status"]],
  body:tableData,

  headStyles:{
    fillColor:[16,185,129]
  },

  alternateRowStyles:{
    fillColor:[240,240,240]
  }
});
  /* FOOTER */

  const finalY = doc.lastAutoTable.finalY + 20;

  doc.text("Authorized HR Signature", 14, finalY);

  doc.line(14, finalY + 2, 80, finalY + 2);

  doc.save("Employee_Report.pdf");
};
  return (
    <div className="space-y-10">

      {/* SUMMARY CARDS  */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        <StatCard
          icon={<Users size={18} />}
          label="Total Employees"
          value={totalEmployees}
          color="emerald"
        />

        <StatCard
          icon={<CheckCircle2 size={18} />}
          label="Active Employees"
          value={activeEmployees}
          color="blue"
        />

        <StatCard
          icon={<XCircle size={18} />}
          label="Inactive Employees"
          value={inactiveEmployees}
          color="red"
        />

      </div>

      {/*  TABLE */}

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">

        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">

  <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
    Employee Details
  </h3>

  <div className="flex gap-2">

    <button
      onClick={exportCSV}
      className="px-3 py-1 text-xs font-semibold bg-blue-500 text-white rounded-lg hover:bg-blue-600"
    >
      CSV
    </button>

    <button
      onClick={exportExcel}
      className="px-3 py-1 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
    >
      Excel
    </button>

    <button
      onClick={exportPDF}
      className="px-3 py-1 text-xs font-semibold bg-red-500 text-white rounded-lg hover:bg-red-600"
    >
      PDF
    </button>

  </div>

</div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>

                  <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase">
                    Name
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase">
                    Department
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase">
                    Joining Date
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase">
                    Email
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase">
                    Status
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">

                {employees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">

                    <td className="px-6 py-4 text-sm font-semibold text-gray-800 dark:text-gray-100">
                      {emp.name}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {emp.department || "—"}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {emp.doj
                        ? new Date(emp.doj).toLocaleDateString()
                        : "—"}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {emp.email}
                    </td>

                    <td className="px-6 py-4">

                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                          emp.status === "Active"
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300"
                            : "bg-red-50 text-red-600 dark:bg-red-900/40 dark:text-red-300"
                        }`}
                      >
                        {emp.status || "Active"}
                      </span>

                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
};

/*  ENTERPRISE STYLE CARD */

const COLOR_MAP = {
  emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300",
  blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300",
  red: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300",
};

const StatCard = ({ icon, label, value, color }) => (

  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition">

    <div className="flex items-center justify-between">

      <div>
        <p className="text-sm font-medium text-gray-400">
          {label}
        </p>

        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
          {value}
        </h2>
      </div>

      <div
        className={`w-12 h-12 flex items-center justify-center rounded-xl ${COLOR_MAP[color]}`}
      >
        {icon}
      </div>

    </div>

  </div>

);
export default EmployeeReport;