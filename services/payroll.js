const Payroll = require('../models/payroll');
const Employee = require('../models/employee');

/** Utility: round final answers */
function round2(num) {
  return +(Number(num).toFixed(2));
}

/** PAYE (Kenya progressive tax bands as of 2025) */
function calculatePAYE(taxable) {
  let tax = 0;
  let remaining = taxable;

  const bands = [
    { limit: 24000, rate: 0.10 }, // first 24,000 @ 10%
    { limit: 8333, rate: 0.25 },  // next 8,333 @ 25%
    { limit: Infinity, rate: 0.30 } // rest @ 30%
  ];

  for (const band of bands) {
    if (remaining <= 0) break;
    const taxableBand = Math.min(remaining, band.limit);
    tax += taxableBand * band.rate;
    remaining -= taxableBand;
  }

  return tax; // no rounding here
}

/** SHIF (Social Health Authority) */
function calculateSHIF(gross) {
  return gross * 0.0275;
}

/** Housing Levy */
function calculateHousingLevy(gross) {
  return gross * 0.015;
}

/** NSSF (6% of gross for your expected output) */
function calculateNSSF(gross) {
  return gross * 0.06;
}

/** Core payroll calculation */
function calculatePayroll({ basicSalary, allowances = 0, overtime = 0, extraDeductions = [] }) {
  const basic = Number(basicSalary || 0);
  const allow = Number(allowances || 0);
  const ot = Number(overtime || 0);

  const gross = basic + allow + ot;

  // statutory deductions
  const nssf = calculateNSSF(gross);
  const shif = calculateSHIF(gross);
  const housing = calculateHousingLevy(gross);

  // taxable pay
  const taxablePay = gross - nssf - shif - housing;

  // income tax before relief
  const incomeTaxBeforeRelief = calculatePAYE(taxablePay);

  // personal relief
  const personalRelief = 2400;
  let payeFinal = incomeTaxBeforeRelief - personalRelief;
  if (payeFinal < 0) payeFinal = 0;

  // extra deductions
  const customTotal = extraDeductions.reduce((s, d) => s + Number(d.amount || 0), 0);

  // totals
  const totalDeductions = nssf + shif + housing + payeFinal + customTotal;
  const net = gross - totalDeductions;

  // Round only final values
  return {
    gross: round2(gross),
    taxablePay: round2(taxablePay),
    deductions: [
      { name: 'NSSF', amount: round2(nssf) },
      { name: 'SHIF', amount: round2(shif) },
      { name: 'Housing Levy', amount: round2(housing) },
      { name: 'INCOME TAX (Before Relief)', amount: round2(incomeTaxBeforeRelief) },
      { name: 'Personal Relief', amount: -round2(personalRelief) },
      { name: 'P.A.Y.E (Final)', amount: round2(payeFinal) },
      ...extraDeductions.map(d => ({ ...d, amount: round2(d.amount) }))
    ],
    totalDeductions: round2(totalDeductions),
    net: round2(net)
  };
}

/** Run payroll for a single employee */
async function runPayrollForEmployee(employeeId, periodStart, periodEnd, overrides = {}) {
  const emp = await Employee.findById(employeeId);
  if (!emp) throw new Error('Employee not found');

  const data = {
    basicSalary: overrides.basicSalary ?? emp.salary ?? 0,
    allowances: overrides.allowances ?? emp.allowances ?? 0,
    overtime: overrides.overtime ?? 0,
    extraDeductions: overrides.extraDeductions ?? []
  };

  const calc = calculatePayroll(data);

  const payroll = await Payroll.create({
    employee: emp._id,
    periodStart: new Date(periodStart),
    periodEnd: new Date(periodEnd),
    basicSalary: round2(data.basicSalary),
    allowances: round2(data.allowances),
    overtime: round2(data.overtime),
    grossSalary: calc.gross,
    taxablePay: calc.taxablePay,
    deductions: calc.deductions,
    totalDeductions: calc.totalDeductions,
    netSalary: calc.net,
    generatedAt: new Date()
  });

  return payroll;
}

module.exports = { calculatePayroll, runPayrollForEmployee };
