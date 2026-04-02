const ApiError = require('../utils/ApiError');
const User = require('../models/User');
const { signAccessToken } = require('./token.service');

async function loginWithEmployeeId(employeeId, password) {
  const user = await User.findOne({ employeeId, isActive: true });

  if (!user) {
    throw new ApiError(401, 'AUTH_INVALID_CREDENTIALS', 'Invalid employee ID or password.');
  }

  // TODO: replace with a password hashing strategy once package access is available.
  const matches = password === user.passwordHash;
  if (!matches) {
    throw new ApiError(401, 'AUTH_INVALID_CREDENTIALS', 'Invalid employee ID or password.');
  }

  const accessToken = signAccessToken(user);
  return {
    accessToken,
    user: {
      id: user._id,
      employeeId: user.employeeId,
      name: user.name,
      role: user.role,
      department: user.department || null,
    },
  };
}

module.exports = { loginWithEmployeeId };
