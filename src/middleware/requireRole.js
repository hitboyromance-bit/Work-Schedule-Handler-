const ApiError = require('../utils/ApiError');

function requireRole(role) {
  return function roleGuard(req, res, next) {
    if (!req.user) {
      return next(new ApiError(401, 'AUTH_REQUIRED', 'Authentication is required.'));
    }

    if (req.user.role !== role) {
      return next(new ApiError(403, 'AUTH_FORBIDDEN', 'You do not have permission to access this resource.'));
    }

    return next();
  };
}

module.exports = { requireRole };
