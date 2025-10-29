const router = require("express").Router();
const {
  runPayroll,
  getPayrollHistory,
  getPayslip,
  getLatestPayslip,
} = require("../controllers/payroll");
const { verifyAccessToken } = require("../middleware/jwt");
const roles = require("../middleware/roles");

router.post("/", verifyAccessToken, roles(["admin", "hr"]), runPayroll);
router.get("/:employeeId", getPayrollHistory);
router.get("/payslip/:id", getPayslip);
router.get("/latestPayslip/:employeeId", getLatestPayslip);

module.exports = router;
