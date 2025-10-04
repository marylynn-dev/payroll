const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: false }, // optional for multi-tenant later
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  periodStart: { type: Date, required: true },
  periodEnd: { type: Date, required: true },
  basicSalary: Number,
  allowances: Number,
  overtime: Number,
  grossSalary: Number,
  deductions: [{ type: { name: String, amount: Number }, _id: false }],
  totalDeductions: Number,
  netSalary: Number,
  generatedAt: { type: Date, default: Date.now },
  payslipUrl: String // can store path/URL to PDF
});

module.exports = mongoose.model('Payroll', payrollSchema);
