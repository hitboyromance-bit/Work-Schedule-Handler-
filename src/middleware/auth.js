const ApiError = require('../utils/ApiError');
const { verifyAccessToken } = require('../services/token.service');
const User = require('../models/User');

async function requireAuth(req, res, next) {
  const authorization = req.headers.authorization || '';
  const [scheme, token] = authorization.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(new ApiError(401, 'AUTH_MISSING_TOKEN', 'Missing or invalid authorization header.'));
  }

  try {
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub).select('-passwordHash');

    if (!user || !user.isActive) {
      return next(new ApiError(401, 'AUTH_INVALID_TOKEN', 'User for this token no longer exists.'));
    }

    req.user = {
      sub: user._id.toString(),
      employeeId: user.employeeId,
      role: user.role,
      name: user.name,
      department: user.department || null,
    };

    return next();
  } catch (error) {
    return next(new ApiError(401, 'AUTH_INVALID_TOKEN', 'Invalid or expired token.'));
  }
}

module.exports = { requireAuth };
