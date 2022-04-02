const Joi = require('@hapi/joi');

function validate(reqBody) {
  const schema = Joi.object({
    title: Joi.string().min(1),
    price: Joi.number().min(0).required(),
    description: Joi.string().min(1).required(),
    location: Joi.string(),
    images: Joi.array(),
  });
  return ({ error, value } = schema.validate(reqBody));
}

module.exports = validate;
