const Employee = require('../models/employee');

const create = async (req, res) => {
    const emp = await Employee.create(req.body);
    res.status(201).send(emp);
};


const list = async (req, res) => {
    const q = {};
    if (req.query.department) q.department = req.query.department;
    const employees = await Employee.find(q).limit(100);
    res.send(employees);
};

const get = async (req, res) => {
    const e = await Employee.findById(req.params.id);
    if (!e) return res.status(404).send({ message: 'Not found' });
    res.send(e);
};

const update = async (req, res) => {
    const e = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!e) return res.status(404).send({ message: 'Not found' });
    res.send(e);
};

const del = async (req, res) => {
    await Employee.findByIdAndDelete(req.params.id);
    res.send({ message: 'Deleted' });
};

module.exports = {
    create,
    list,
    get,
    update,
    del
}