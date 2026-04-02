const ApiError = require('../utils/ApiError');
const { verifyAccessToken } = require('../services/token.service');

function requireAuth(req, res, next) {
  const authorization = req.headers.authorization || '';
  const [scheme, token] = authorization.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(new ApiError(401, 'AUTH_MISSING_TOKEN', 'Missing or invalid authorization header.'));
  }

  try {
    req.user = verifyAccessToken(token);
    return next();
  } catch (error) {
    return next(new ApiError(401, 'AUTH_INVALID_TOKEN', 'Invalid or expired token.'));
  }
}

module.exports = { requireAuth };
