const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');

function toDate(value, fieldName) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new ApiError(400, 'VALIDATION_ERROR', `${fieldName} must be a valid ISO date.`);
  }
  return date;
}

function validateDateRangeQuery(query = {}) {
  let from;
  let to;

  if (query.from) {
    from = toDate(query.from, 'from');
  }

  if (query.to) {
    to = toDate(query.to, 'to');
  }

  if (from && to && from > to) {
    throw new ApiError(400, 'VALIDATION_ERROR', '`from` cannot be later than `to`.');
  }

  return { from, to };
}

function validatePaginationQuery(query = {}) {
  const page = query.page ? Number(query.page) : 1;
  const limit = query.limit ? Number(query.limit) : 20;

  if (!Number.isInteger(page) || page < 1) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'page must be a positive integer.');
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'limit must be an integer between 1 and 100.');
  }

  return { page, limit, skip: (page - 1) * limit };
}

function validateCreateScheduleBody(body) {
  if (!body || typeof body !== 'object') {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Request body must be a JSON object.');
  }

  const requiredFields = ['employeeId', 'date', 'startTime', 'endTime'];
  const missing = requiredFields.filter((field) => !body[field]);

  if (missing.length > 0) {
    throw new ApiError(400, 'VALIDATION_ERROR', `Missing required fields: ${missing.join(', ')}.`);
  }

  toDate(body.date, 'date');

  if (body.startTime >= body.endTime) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'startTime must be before endTime.');
  }
}

function validateUpdateScheduleBody(body) {
  if (!body || typeof body !== 'object') {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Request body must be a JSON object.');
  }

  const allowedFields = ['date', 'startTime', 'endTime', 'location', 'notes', 'status'];
  const keys = Object.keys(body);
  const disallowed = keys.filter((key) => !allowedFields.includes(key));

  if (disallowed.length > 0) {
    throw new ApiError(400, 'VALIDATION_ERROR', `Unsupported fields: ${disallowed.join(', ')}.`);
  }

  if (body.date) {
    toDate(body.date, 'date');
  }

  const startTime = body.startTime;
  const endTime = body.endTime;
  if (startTime && endTime && startTime >= endTime) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'startTime must be before endTime.');
  }
}

function validateScheduleId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid schedule ID.');
  }
}

module.exports = {
  validateDateRangeQuery,
  validatePaginationQuery,
  validateCreateScheduleBody,
  validateUpdateScheduleBody,
  validateScheduleId,
};
