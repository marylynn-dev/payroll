const Employee = require("../models/employee");
const User = require("../models/user");
const createError = require("http-errors");

const create = async (req, res) => {
  const emp = await Employee.create(req.body);
  res.status(201).send(emp);
};

// controllers/employeeController.js

// controllers/employeeController.js

const approveAccess = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1. Fetch the Employee (The Profile)
    const employee = await Employee.findById(id);
    if (!employee) throw createError.NotFound("Employee not found");

    // 2. Check the User Collection (The Security Gate)
    const userExists = await User.findOne({ email: employee.email });
    if (userExists) throw createError.Conflict("User account already exists");

    const defaultPassword = "WelcomeToPayRoll123!";

    // 3. Update Employee Profile
    employee.status = "approved";
    employee.active = true;
    await employee.save();

    // 4. Create the User Login
    // This makes them "officially" able to log in
    const newUser = new User({
      email: employee.email,
      password: defaultPassword,
      role: "employee", // This tells the system they aren't an admin/hr
    });
    await newUser.save();

    res.send({
      message: `${employee.firstName} approved and user account created.`,
    });
  } catch (error) {
    next(error);
  }
};
// routes/employeeRoutes.js (or wherever your employee routes are)

const getPendingRequests = async (req, res, next) => {
  try {
    // Security Guard: Check if the logged-in user is HR or Admin
    // This 'req.user' comes from your 'verifyAccessToken' middleware
    if (req.user.role !== "hr" && req.user.role !== "admin") {
      throw createError.Forbidden("Access denied. HR credentials required.");
    }

    // Fetch only the people who haven't been approved yet
    const pending = await Employee.find({ status: "pending" });

    res.status(200).send(pending);
  } catch (error) {
    next(error);
  }
};

const list = async (req, res) => {
  const q = {};
  if (req.query.department) q.department = req.query.department;
  const employees = await Employee.find(q).limit(100);
  res.send(employees);
};

const getOne = async (req, res) => {
  const e = await Employee.findById(req.params.id);
  if (!e) return res.status(404).send({ message: "Not found" });
  res.send(e);
};

const update = async (req, res) => {
  const e = await Employee.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!e) return res.status(404).send({ message: "Not found" });
  res.send(e);
};

const del = async (req, res) => {
  await Employee.findByIdAndDelete(req.params.id);
  res.send({ message: "Deleted" });
};

module.exports = {
  create,
  list,
  getOne,
  update,
  del,
  approveAccess,
  getPendingRequests,
};
