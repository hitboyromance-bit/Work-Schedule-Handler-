const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.sub).select('-passwordHash');

  if (!user || !user.isActive) {
    throw new ApiError(404, 'USER_NOT_FOUND', 'Authenticated user was not found.');
  }

  res.status(200).json({ user });
});

module.exports = { getMe };
