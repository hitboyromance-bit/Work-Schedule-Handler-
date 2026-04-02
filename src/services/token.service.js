const crypto = require('crypto');
const env = require('../config/env');

function encode(payload) {
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

function decode(base64) {
  return JSON.parse(Buffer.from(base64, 'base64url').toString('utf8'));
}

function sign(data) {
  return crypto.createHmac('sha256', env.jwtSecret).update(data).digest('base64url');
}

function parseExpiresIn(expiresIn) {
  const raw = String(expiresIn || '1h').trim();
  const match = raw.match(/^(\d+)(ms|s|m|h|d)?$/i);

  if (!match) {
    return 60 * 60 * 1000;
  }

  const value = Number(match[1]);
  const unit = (match[2] || 'ms').toLowerCase();
  const multipliers = {
    ms: 1,
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return value * multipliers[unit];
}

function signAccessToken(user) {
  const now = Date.now();
  const payload = {
    sub: user._id.toString(),
    employeeId: user.employeeId,
    role: user.role,
    name: user.name,
    iat: now,
    exp: now + parseExpiresIn(env.jwtExpiresIn),
  };

  const encodedPayload = encode(payload);
  const signature = sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

function verifyAccessToken(token) {
  const [encodedPayload, signature] = token.split('.');

  if (!encodedPayload || !signature) {
    throw new Error('Invalid token format');
  }

  const expected = sign(encodedPayload);
  const providedBuffer = Buffer.from(signature, 'base64url');
  const expectedBuffer = Buffer.from(expected, 'base64url');

  if (providedBuffer.length !== expectedBuffer.length) {
    throw new Error('Invalid token signature');
  }

  if (!crypto.timingSafeEqual(providedBuffer, expectedBuffer)) {
    throw new Error('Invalid token signature');
  }

  const payload = decode(encodedPayload);
  if (!payload.exp || payload.exp < Date.now()) {
    throw new Error('Token expired');
  }

  return payload;
}

module.exports = { signAccessToken, verifyAccessToken, parseExpiresIn };
