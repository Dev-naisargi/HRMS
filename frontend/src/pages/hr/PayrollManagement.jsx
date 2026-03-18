import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { DollarSign, CheckCircle, Clock } from "lucide-react";
import api from "../../utils/api";
import jsPDF from "jspdf";

const PayrollManagement = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedEmployeeDetails, setSelectedEmployeeDetails] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");

  const [salaryData, setSalaryData] = useState({
    basicSalary: "",
    allowance: "",
    bonus: "",
    deductions: "",
  });

  const netSalary =
    Number(salaryData.basicSalary || 0) +
    Number(salaryData.allowance || 0) +
    Number(salaryData.bonus || 0) -
    Number(salaryData.deductions || 0);

  useEffect(() => {
    fetchPayrolls();
    fetchEmployees();
  }, []);

  /* Fetch Payroll  */

  const fetchPayrolls = async () => {
    try {
      const res = await api.get("/payroll");
      setPayrolls(res.data.payrolls || []);
    } catch {
      console.log("Payroll fetch error");
    }
  };

  /*  Fetch Employees  */

  const fetchEmployees = async () => {
    try {
      const res = await api.get("/employees");

      const data = res.data.employees || [];

      setAllEmployees(data);

      const deptSet = new Set();

      data.forEach((emp) => {
        if (emp.department) deptSet.add(emp.department);
      });

      setDepartments([...deptSet]);
    } catch {
      console.log("Employee fetch error");
    }
  };

  /* Department Change  */

  const handleDepartmentChange = (dept) => {
    const filtered = allEmployees.filter((emp) => emp.department === dept);

    setEmployees(filtered);
  };

  /*  Employee Select  */

  const handleEmployeeChange = (id) => {
    const emp = employees.find((e) => e.user === id);

    setSelectedEmployee(id);
    setSelectedEmployeeDetails(emp);
  };

  /*  Professional Payslip */

  const generatePayslip = () => {
    if (!selectedEmployeeDetails) return;

    const emp = selectedEmployeeDetails;

    /*  Date Formatting  */

    let birthDate =
      emp.birthdate || emp.birthDate || emp.dob || emp.dateOfBirth;

    birthDate = birthDate ? new Date(birthDate).toLocaleDateString() : "-";

    let joiningDate =
      emp.joiningDate ||
      emp.joinDate ||
      emp.dateOfJoining ||
      emp.joining_date ||
      emp.doj;

    joiningDate = joiningDate
      ? new Date(joiningDate).toLocaleDateString()
      : "-";

    /* Create PDF */

    const doc = new jsPDF();

    /*  Header  */

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");

    doc.text("Your Company Pvt Ltd", 105, 20, { align: "center" });

    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");

    doc.text("Salary Payslip", 105, 30, { align: "center" });

    /*  Month  */

    doc.setFontSize(11);

    doc.text(
      `Payslip Month : ${new Date().toLocaleString("default", { month: "long", year: "numeric" })}`,
      20,
      45,
    );

    /*  Employee Details  */

    doc.setFont("helvetica", "bold");
    doc.text("Employee Information", 20, 60);

    doc.line(20, 63, 190, 63);

    doc.setFont("helvetica", "normal");

    doc.text(`Full Name : ${emp.name}`, 20, 75);
    doc.text(`Email : ${emp.email}`, 20, 85);

    doc.text(`Department : ${emp.department}`, 20, 95);
    doc.text(`Position : ${emp.position}`, 20, 105);

    doc.text(`Birth Date : ${birthDate}`, 120, 75);
    doc.text(`Joining Date : ${joiningDate}`, 120, 85);

    /*  Salary Table*/

    doc.setFont("helvetica", "bold");

    doc.text("Salary Details", 20, 125);

    doc.line(20, 128, 190, 128);

    /* Table Header */

    doc.setFontSize(11);

    doc.text("Component", 25, 140);
    doc.text("Amount (₹)", 160, 140);

    doc.line(20, 143, 190, 143);

    /* Table Rows */

    doc.setFont("helvetica", "normal");

    doc.text("Basic Salary", 25, 155);
    doc.text(`${salaryData.basicSalary}`, 160, 155);

    doc.text("Allowance", 25, 165);
    doc.text(`${salaryData.allowance}`, 160, 165);

    doc.text("Bonus", 25, 175);
    doc.text(`${salaryData.bonus}`, 160, 175);

    doc.text("Deductions", 25, 185);
    doc.text(`${salaryData.deductions}`, 160, 185);

    /*  Net Salary  */

    doc.setFont("helvetica", "bold");

    doc.line(20, 195, 190, 195);

    doc.setFontSize(13);

    doc.text("Net Salary", 25, 210);
    doc.text(`₹ ${netSalary}`, 160, 210);

    /*  Footer  */

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    doc.text("This is a computer generated payslip.", 20, 240);

    doc.text("Authorized Signature", 150, 240);

    /*  Save  */

    doc.save(`${emp.name}_Payslip.pdf`);
  };

  /*  Generate Payroll */

  const generatePayroll = async () => {
    try {
      await api.post("/payroll", {
        employee: selectedEmployee,
        basicSalary: salaryData.basicSalary,
        allowance: salaryData.allowance,
        bonus: salaryData.bonus,
        deductions: salaryData.deductions,
        netPay: netSalary,
      });

      generatePayslip();

      setShowModal(false);

      fetchPayrolls();
    } catch {
      console.log("Payroll failed");
    }
  };
  const filteredPayrolls = payrolls.filter((p) => {
    const nameMatch = p.employee?.name
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const statusMatch = statusFilter === "" || p.status === statusFilter;

    const departmentMatch =
      departmentFilter === "" || p.employee?.department === departmentFilter;

    return nameMatch && statusMatch && departmentMatch;
  });

  return (
    <div className="space-y-6 text-gray-800 dark:text-gray-200">
      {/* Header */}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Payroll Management</h2>
          <p className="text-sm text-gray-400">Manage employee salaries</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg"
        >
          Pay Salary
        </button>
      </div>
      {/* Payroll Summary */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Payroll"
          value={`₹${payrolls.reduce((sum, p) => sum + p.netPay, 0)}`}
          color="blue"
        />

        <StatCard
          title="Paid Employees"
          value={payrolls.filter((p) => p.status === "Paid").length}
          color="emerald"
        />

        <StatCard
          title="Pending Payments"
          value={payrolls.filter((p) => p.status === "Pending").length}
          color="amber"
        />
      </div>
      {/* Filters */}

      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search employee..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg text-sm w-full md:w-1/3"
        />

        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="border dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg text-sm w-full md:w-1/4"
        >
          <option value="">All Departments</option>

          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg text-sm w-full md:w-1/4"
        >
          <option value="">All Status</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
        </select>
      </div>
      {/* Payroll Table */}

      <div className="bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-6 py-3 text-left">Employee</th>
              <th className="px-6 py-3 text-left">Department</th>
              <th className="px-6 py-3 text-left">Salary</th>
              <th className="px-6 py-3 text-left">Bonus</th>
              <th className="px-6 py-3 text-left">Deduction</th>
              <th className="px-6 py-3 text-left">Net Pay</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredPayrolls.map((p) => (
              <tr key={p._id} className="border-t dark:border-gray-700">
                <td className="px-6 py-4">
                  <p className="font-semibold">{p.employee?.name}</p>
                  <p className="text-xs text-gray-400">
                    {p.employee?.position}
                  </p>
                </td>

                <td className="px-6 py-4">{p.employee?.department}</td>

                <td className="px-6 py-4">₹{p.basicSalary}</td>

                <td className="px-6 py-4 text-emerald-600">+₹{p.bonus || 0}</td>

                <td className="px-6 py-4 text-red-500">
                  -₹{p.deductions || 0}
                </td>

                <td className="px-6 py-4 font-semibold">₹{p.netPay}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      p.status === "Paid"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {p.status || "Pending"}
                  </span>
                </td>

                <td className="px-6 py-4">
                  {p.status !== "Paid" && (
                    <button
                      onClick={() => setShowModal(true)}
                      className="bg-emerald-600 text-white px-3 py-1 rounded text-xs"
                    >
                      Pay
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50  backdrop-blur-sm p-4">
          <div
            className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200
        w-full max-w-md rounded-2xl p-6 shadow-2xl border dark:border-gray-700"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Generate Payroll</h3>

              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={18} />
              </button>
            </div>

            {/* Department */}

            <label className="text-xs text-gray-400 uppercase font-bold">
              Department
            </label>

            <select
              className="w-full border dark:border-gray-700 bg-white dark:bg-gray-800 p-2 rounded-lg mt-1 mb-3"
              onChange={(e) => handleDepartmentChange(e.target.value)}
            >
              <option>Select Department</option>

              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            {/* Employee */}

            <label className="text-xs text-gray-400 uppercase font-bold">
              Employee
            </label>

            <select
              className="w-full border dark:border-gray-700 bg-white dark:bg-gray-800 p-2 rounded-lg mt-1 mb-3"
              onChange={(e) => handleEmployeeChange(e.target.value)}
            >
              <option>Select Employee</option>

              {employees.map((emp) => (
                <option key={emp._id} value={emp.user}>
                  {emp.name}
                </option>
              ))}
            </select>

            {/* Employee Details */}

            {selectedEmployeeDetails && (
              <div
                className="bg-gray-50 dark:bg-gray-800 border dark:border-gray-700
            rounded-xl p-4 mb-4 text-sm space-y-2"
              >
                <p>
                  <b>Email:</b> {selectedEmployeeDetails.email}
                </p>
                <p>
                  <b>Position:</b> {selectedEmployeeDetails.position}
                </p>
                <p>
                  <b>Department:</b> {selectedEmployeeDetails.department}
                </p>
              </div>
            )}

            {/* Salary Inputs */}

            <input
              placeholder="Basic Salary"
              className="w-full border dark:border-gray-700 bg-white dark:bg-gray-800 p-2 rounded-lg mb-2"
              onChange={(e) =>
                setSalaryData({ ...salaryData, basicSalary: e.target.value })
              }
            />

            <input
              placeholder="Allowance"
              className="w-full border dark:border-gray-700 bg-white dark:bg-gray-800 p-2 rounded-lg mb-2"
              onChange={(e) =>
                setSalaryData({ ...salaryData, allowance: e.target.value })
              }
            />

            <input
              placeholder="Bonus"
              className="w-full border dark:border-gray-700 bg-white dark:bg-gray-800 p-2 rounded-lg mb-2"
              onChange={(e) =>
                setSalaryData({ ...salaryData, bonus: e.target.value })
              }
            />

            <input
              placeholder="Deductions"
              className="w-full border dark:border-gray-700 bg-white dark:bg-gray-800 p-2 rounded-lg mb-3"
              onChange={(e) =>
                setSalaryData({ ...salaryData, deductions: e.target.value })
              }
            />

            {/* Net Salary */}

            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-center font-semibold mb-3">
              Net Salary : ₹{netSalary}
            </div>

            <div className="flex gap-3">
              <button
                onClick={generatePayroll}
                className="flex-1 bg-emerald-600 text-white py-2 rounded-lg"
              >
                Generate Payroll
              </button>

              <button
                onClick={generatePayslip}
                className="flex-1 border border-gray-300 dark:border-gray-700 py-2 rounded-lg"
              >
                Download Payslip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
const StatCard = ({ title, value, color }) => {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300",
    emerald:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300",
    amber:
      "bg-amber-50 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300",
  };

  const iconMap = {
    "Total Payroll": <DollarSign size={20} />,
    "Paid Employees": <CheckCircle size={20} />,
    "Pending Payments": <Clock size={20} />,
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
      {/* ICON */}
      <div
        className={`w-10 h-10 flex items-center justify-center rounded-xl mb-4 ${colorMap[color]}`}
      >
        {iconMap[title]}
      </div>

      {/* VALUE */}
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
        {value}
      </h2>

      {/* LABEL */}
      <p className="text-gray-400 text-sm mt-1 font-medium">{title}</p>
    </div>
  );
};
export default PayrollManagement;
