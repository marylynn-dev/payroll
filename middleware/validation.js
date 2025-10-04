const Joi = require('joi');

const user = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    role: Joi.string().required(),
});

module.exports = user
