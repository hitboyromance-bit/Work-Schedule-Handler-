const ApiError = require('../utils/ApiError');
const User = require('../models/User');
const { signAccessToken } = require('./token.service');
const { verifyPassword, hashPassword } = require('./password.service');

function normalizeUser(user) {
  return {
    id: user._id,
    employeeId: user.employeeId,
    name: user.name,
    role: user.role,
    department: user.department || null,
  };
}

async function loginWithEmployeeId(employeeId, password) {
  const user = await User.findOne({ employeeId, isActive: true });

  if (!user) {
    throw new ApiError(401, 'AUTH_INVALID_CREDENTIALS', 'Invalid employee ID or password.');
  }

  const matches = verifyPassword(password, user.passwordHash);
  if (!matches) {
    throw new ApiError(401, 'AUTH_INVALID_CREDENTIALS', 'Invalid employee ID or password.');
  }

  const accessToken = signAccessToken(user);
  return {
    accessToken,
    user: normalizeUser(user),
  };
}

async function bootstrapManager({ employeeId, name, password, department }) {
  const existingManager = await User.findOne({ role: 'manager', isActive: true });
  if (existingManager) {
    throw new ApiError(409, 'MANAGER_ALREADY_EXISTS', 'A manager account already exists.');
  }

  const existingEmployee = await User.findOne({ employeeId });
  if (existingEmployee) {
    throw new ApiError(409, 'EMPLOYEE_ID_EXISTS', 'employeeId already exists.');
  }

  const user = await User.create({
    employeeId,
    name,
    role: 'manager',
    department,
    passwordHash: hashPassword(password),
  });

  return {
    user: normalizeUser(user),
  };
}

async function createUserAccount({ employeeId, name, password, role, department }) {
  const existingEmployee = await User.findOne({ employeeId });
  if (existingEmployee) {
    throw new ApiError(409, 'EMPLOYEE_ID_EXISTS', 'employeeId already exists.');
  }

  const user = await User.create({
    employeeId,
    name,
    role,
    department,
    passwordHash: hashPassword(password),
  });

  return {
    user: normalizeUser(user),
  };
}

module.exports = { loginWithEmployeeId, bootstrapManager, createUserAccount };
