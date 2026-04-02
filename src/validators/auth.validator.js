const ApiError = require('../utils/ApiError');

function requireObject(body) {
  if (!body || typeof body !== 'object') {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Request body must be a JSON object.');
  }
}

function validateLoginBody(body) {
  requireObject(body);
  const errors = [];

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

function validateCreateUserBody(body) {
  requireObject(body);
  const errors = [];

  if (!body.employeeId || typeof body.employeeId !== 'string') {
    errors.push({ field: 'employeeId', message: 'employeeId is required and must be a string.' });
  }

  if (!body.name || typeof body.name !== 'string') {
    errors.push({ field: 'name', message: 'name is required and must be a string.' });
  }

  if (!body.password || typeof body.password !== 'string' || body.password.length < 8) {
    errors.push({ field: 'password', message: 'password is required and must be at least 8 characters.' });
  }

  if (!body.role || !['manager', 'worker'].includes(body.role)) {
    errors.push({ field: 'role', message: "role is required and must be 'manager' or 'worker'." });
  }

  if (errors.length > 0) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid user creation payload.', errors);
  }
}

function validateBootstrapBody(body) {
  validateCreateUserBody({ ...body, role: 'manager' });
}

module.exports = { validateLoginBody, validateCreateUserBody, validateBootstrapBody };
