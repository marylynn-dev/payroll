const Joi = require("joi");

const userValidation = Joi.object({
  email: Joi.string().email().required(),
  role: Joi.string().required(),
  password: Joi.string().required(),
});

const requestAccessValidation = Joi.object({
  fullName: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().lowercase().required(),
});

module.exports = {
  requestAccessValidation,
  userValidation,
};
