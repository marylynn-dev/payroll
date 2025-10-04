const Payroll = require('../models/payroll');
const Employee = require('../models/employee');
const { runPayrollForEmployee } = require('../services/payroll');
const { generatePayslip } = require('../utils/pdf');
const path = require('path');
const fs = require('fs');

/**
 * POST /api/payrolls/run
 * Run payroll for one or more employees
 */
const runPayroll = async (req, res) => {
  try {
    const { employeeIds, periodStart, periodEnd } = req.body;

    if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
      return res.status(400).json({ message: 'employeeIds (array) required' });
    }

    const results = [];
    for (const id of employeeIds) {
      const payroll = await runPayrollForEmployee(id, new Date(periodStart), new Date(periodEnd));
      results.push(payroll);
    }

    return res.status(201).json(results);
  } catch (err) {
    console.error('Error running payroll:', err);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
};

/**
 * GET /api/payrolls/:employeeId
 * View payroll history for an employee
 */
const getPayrollHistory = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const payrolls = await Payroll.find({ employee: employeeId })
      .populate('employee', 'firstName lastName email position department')
      .sort({ periodStart: -1 });

    if (!payrolls || payrolls.length === 0) {
      return res.status(404).json({ message: 'No payroll records found for this employee' });
    }

    res.json(payrolls);
  } catch (err) {
    console.error('Error fetching payroll history:', err);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
};

/**
 * GET /api/payrolls/:id/payslip
 * Generate & download payslip PDF
 */
const getPayslip = async (req, res) => {
  try {
    const { id } = req.params;
    const payroll = await Payroll.findById(id).populate('employee');

    if (!payroll) {
      return res.status(404).json({ message: 'Payroll not found' });
    }

    // Ensure payslips folder exists
    const payslipsDir = path.join(__dirname, '../payslips');
    if (!fs.existsSync(payslipsDir)) {
      fs.mkdirSync(payslipsDir, { recursive: true });
    }

    // Output path for the PDF
    const outputPath = path.join(payslipsDir, `payslip-${id}.pdf`);

    // Generate PDF
    await generatePayslip(payroll, outputPath);

    // Download file
    res.download(
      outputPath,
      `Payslip-${payroll.employee.firstName}-${payroll.periodEnd.toISOString().slice(0, 10)}.pdf`
    );
  } catch (err) {
    console.error('Error generating payslip:', err);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
};

module.exports = {
  runPayroll, getPayrollHistory, getPayslip
}