const ApiError = require('../utils/ApiError');

function validateLoginBody(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Request body must be a JSON object.');
  }

  if (!body.employeeId || typeof body.employeeId !== 'string') {
    errors.push({ field: 'employeeId', message: 'employeeId is required and must be a string.' });
  }

  if (!body.password || typeof body.password !== 'string') {
    errors.push({ field: 'password', message: 'password is required and must be a string.' });
  }

  if (errors.length > 0) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid login payload.', errors);
  }
}

module.exports = { validateLoginBody };
