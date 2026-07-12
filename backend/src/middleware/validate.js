const { badRequest } = require('../utils/apiResponse');

/**
 * Joi validation middleware factory
 * @param {import('joi').ObjectSchema} schema - Joi schema
 * @param {'body'|'query'|'params'} source - Request property to validate
 * @returns {Function} Express middleware
 *
 * Usage: validate(createVehicleSchema, 'body')
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((d) => d.message);
      return badRequest(res, 'Validation error', messages);
    }

    // Replace with sanitized values
    req[source] = value;
    next();
  };
};

module.exports = validate;
