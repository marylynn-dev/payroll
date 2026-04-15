// models/employee.js
const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    email: { type: String, unique: true, required: true },
    department: String,
    position: String,
    employmentType: {
      type: String,
      enum: ["full-time", "part-time", "contractor"],
      default: "full-time",
    },
    salary: { type: Number, default: 0 }, // Changed: Default 0 for pending requests
    allowances: { type: Number, default: 0 },
    paySchedule: {
      type: String,
      enum: ["weekly", "bi-weekly", "monthly"],
      default: "monthly",
    },
    taxId: String,
    active: { type: Boolean, default: false }, // Default false until approved
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    password: { type: String }, // Removed required: true for the request phase
    role: { type: String, default: "employee" },
  },
  { timestamps: true },
);

const Employee = mongoose.model("Employee", employeeSchema);

module.exports = Employee;
