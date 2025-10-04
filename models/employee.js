const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: { type: String, unique: true, required: true },
    department: String,
    position: String,
    employmentType: { type: String, enum: ['full-time', 'part-time', 'contractor'], default: 'full-time' },
    salary: { type: Number, required: true }, // basic salary
    allowances: { type: Number, default: 0 },
    paySchedule: { type: String, enum: ['weekly', 'bi-weekly', 'monthly'], default: 'monthly' },
    taxId: String,
    active: { type: Boolean, default: true },
}, { timestamps: true });

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee

