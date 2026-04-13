import React, { useEffect, useState } from 'react';
import { Download, Eye, Calendar, DollarSign, X } from 'lucide-react';
import api from '../../utils/api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const EmployeePayroll = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayroll, setSelectedPayroll] = useState(null);

  useEffect(() => {
    fetchPayrolls();
  }, []);

  const fetchPayrolls = async () => {
    try {
      const res = await api.get('/payroll');
      setPayrolls(res.data.payrolls || []);
    } catch (err) {
      console.error('Error fetching payrolls:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (payroll) => {
    try {
      const doc = new jsPDF();

      // Title
      doc.setFontSize(20);
      doc.setTextColor(22, 163, 74);
      doc.text('SALARY PAYSLIP', 105, 18, { align: 'center' });

      // Employee info
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(`Employee : ${localStorage.getItem('userName') || 'Employee'}`, 14, 32);
      doc.text(`Period   : ${payroll.month} ${payroll.year}`, 14, 39);
      doc.text(`Status   : ${payroll.status}`, 14, 46);
      doc.text(`Generated: ${new Date(payroll.createdAt).toLocaleDateString()}`, 14, 53);

      // Earnings table
      autoTable(doc, {
        startY: 62,
        head: [['Earnings', 'Amount (INR)']],
        body: [
          ['Basic Salary', `Rs ${payroll.basicSalary?.toLocaleString() || 0}`],
          ['Bonus', `Rs ${payroll.bonus?.toLocaleString() || 0}`],
        ],
        theme: 'grid',
        headStyles: { fillColor: [22, 163, 74], textColor: 255 },
      });

      // Deductions table
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 8,
        head: [['Deductions', 'Amount (INR)']],
        body: [
          ['Deductions (PF/Tax)', `Rs ${payroll.deductions?.toLocaleString() || 0}`],
          ['Leave Deduction', `Rs ${payroll.leaveDeduction?.toLocaleString() || 0}`],
        ],
        theme: 'grid',
        headStyles: { fillColor: [220, 38, 38], textColor: 255 },
      });

      // Net Pay
      const finalY = doc.lastAutoTable.finalY + 12;
      doc.setFontSize(14);
      doc.setTextColor(22, 163, 74);
      doc.text(`NET PAY: Rs ${payroll.netPay?.toLocaleString() || 0}`, 14, finalY);

      doc.save(`Payslip_${payroll.month}_${payroll.year}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      PAID: 'bg-green-100 text-green-800 border-green-200',
      APPROVED: 'bg-blue-100 text-blue-800 border-blue-200',
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return (
      <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${variants[status] || variants.PENDING}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Payslips</h1>
          <p className="text-gray-600 mt-1">View and download your salary slips</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {payrolls.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <Calendar size={48} className="text-gray-300 mb-4" />
            <p className="text-gray-500">No payslips available yet</p>
          </div>
        ) : (
          payrolls.map((payroll) => (
            <div
              key={payroll._id}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{payroll.month}</h3>
                  <p className="text-sm text-gray-500">{payroll.year}</p>
                </div>
                {getStatusBadge(payroll.status)}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Basic Salary</span>
                  <span className="text-gray-900">₹{payroll.basicSalary?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Bonus</span>
                  <span className="text-green-600">+₹{payroll.bonus?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Deductions</span>
                  <span className="text-red-600">-₹{(payroll.deductions + payroll.leaveDeduction).toLocaleString()}</span>
                </div>
              </div>

              <div className="border-t pt-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900">Net Pay</span>
                  <span className="text-xl font-bold text-gray-900">₹{payroll.netPay?.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedPayroll(payroll)}
                  className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Eye size={14} className="mr-2" />
                  View
                </button>
                <button
                  onClick={() => handleDownload(payroll)}
                  className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-md shadow-emerald-500/20 transition-colors"
                >
                  <Download size={14} className="mr-2" />
                  Download PDF
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedPayroll && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Payslip Details</h3>
              <button
                onClick={() => setSelectedPayroll(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-center pb-4 border-b border-gray-200">
                <p className="text-sm text-gray-600">{selectedPayroll.month} {selectedPayroll.year}</p>
                {getStatusBadge(selectedPayroll.status)}
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-900">Earnings</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Basic Salary</span>
                    <span className="text-gray-900">₹{selectedPayroll.basicSalary?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Bonus</span>
                    <span className="text-green-600">+₹{selectedPayroll.bonus?.toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t flex justify-between text-sm font-medium">
                    <span className="text-gray-900">Total Earnings</span>
                    <span className="text-gray-900">₹{(selectedPayroll.basicSalary + selectedPayroll.bonus).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-900">Deductions</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Deductions</span>
                    <span className="text-red-600">-₹{selectedPayroll.deductions?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Leave Deduction</span>
                    <span className="text-red-600">-₹{selectedPayroll.leaveDeduction?.toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t flex justify-between text-sm font-medium">
                    <span className="text-gray-900">Total Deductions</span>
                    <span className="text-red-600">-₹{(selectedPayroll.deductions + selectedPayroll.leaveDeduction).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Net Salary</span>
                  <span className="text-2xl font-bold text-gray-900">₹{selectedPayroll.netPay?.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => handleDownload(selectedPayroll)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-colors"
                >
                  <Download size={14} className="mr-2 inline" />
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeePayroll;