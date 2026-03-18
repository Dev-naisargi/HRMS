import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import jsPDF from "jspdf";
import { DollarSign, CheckCircle, Calendar } from "lucide-react";

const MyPayroll = () => {
  const [payrolls, setPayrolls] = useState([]);

  useEffect(() => {
    fetchPayroll();
  }, []);

  const fetchPayroll = async () => {
    try {
      const res = await api.get("/payroll");

      setPayrolls(res.data.payrolls || []);
    } catch {
      console.log("Payroll fetch error");
    }
  };

  /*  Download Payslip  */

  const downloadPayslip = (p) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Salary Payslip", 105, 20, { align: "center" });

    doc.setFontSize(11);

    doc.text(`Employee : ${p.employee.name}`, 20, 50);
    doc.text(`Department : ${p.employee.department}`, 20, 60);

    doc.line(20, 70, 190, 70);

    doc.text("Salary Details", 20, 85);

    doc.text("Basic Salary", 25, 100);
    doc.text(`₹ ${p.basicSalary}`, 160, 100);

    doc.text("Bonus", 25, 110);
    doc.text(`₹ ${p.bonus}`, 160, 110);

    doc.text("Deductions", 25, 120);
    doc.text(`₹ ${p.deductions}`, 160, 120);

    doc.line(20, 130, 190, 130);

    doc.setFontSize(13);
    doc.text("Net Salary", 25, 145);
    doc.text(`₹ ${p.netPay}`, 160, 145);

    doc.output("dataurlnewwindow");
  };

  const currentMonthPayroll = payrolls[0];

  return (
    <div className="space-y-6 text-gray-800 dark:text-gray-200">
      {/* Header */}

      <div>
        <h2 className="text-2xl font-bold">My Payroll</h2>

        <p className="text-sm text-gray-400">View your salary and payslip</p>
      </div>

      {/* Stat Cards */}

      {currentMonthPayroll && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
              <DollarSign className="text-emerald-600" size={20} />
            </div>

            <div>
              <p className="text-xs text-gray-400 uppercase">Net Salary</p>

              <p className="text-xl font-semibold">
                ₹{Number(currentMonthPayroll.netPay).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div
              className={`p-3 rounded-xl ${
                currentMonthPayroll.status === "Paid"
                  ? "bg-emerald-100 dark:bg-emerald-900/30"
                  : "bg-amber-100 dark:bg-amber-900/30"
              }`}
            >
              <CheckCircle
                size={20}
                className={
                  currentMonthPayroll.status === "Paid"
                    ? "text-emerald-600"
                    : "text-amber-600"
                }
              />
            </div>

            <div>
              <p className="text-xs text-gray-400 uppercase">Status</p>

              <p
                className={`font-semibold ${
                  currentMonthPayroll.status === "Paid"
                    ? "text-emerald-600"
                    : "text-amber-600"
                }`}
              >
                {currentMonthPayroll.status}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Calendar className="text-blue-600" size={20} />
            </div>

            <div>
              <p className="text-xs text-gray-400 uppercase">Month</p>

              <p className="font-semibold">
                {new Date().toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Payroll Table */}

      <div className="bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-6 py-3 text-left">Month</th>

              <th className="px-6 py-3 text-left">Basic</th>

              <th className="px-6 py-3 text-left">Bonus</th>

              <th className="px-6 py-3 text-left">Deduction</th>

              <th className="px-6 py-3 text-left">Net Pay</th>

              <th className="px-6 py-3 text-left">Status</th>

              <th className="px-6 py-3 text-left">Payslip</th>
            </tr>
          </thead>

          <tbody>
            {payrolls.map((p) => (
              <tr key={p._id} className="border-t dark:border-gray-700">
                <td className="px-6 py-4">
                  {new Date().toLocaleString("default", {
                    month: "short",
                    year: "numeric",
                  })}
                </td>

                <td className="px-6 py-4">
                  ₹{Number(p.basicSalary).toLocaleString()}
                </td>

                <td className="px-6 py-4 text-emerald-600">
                  ₹{Number(p.bonus).toLocaleString()}
                </td>

                <td className="px-6 py-4 text-red-500">
                  ₹{Number(p.deductions).toLocaleString()}
                </td>

                <td className="px-6 py-4 font-semibold">
                  ₹{Number(p.netPay).toLocaleString()}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      p.status === "Paid"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/30"
                    }`}
                  >
                    {p.status}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <button
                    onClick={() => downloadPayslip(p)}
                    className="text-emerald-600 hover:text-emerald-700 text-sm font-semibold"
                  >
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyPayroll;
