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

function signAccessToken(user) {
  const payload = {
    sub: user._id.toString(),
    employeeId: user.employeeId,
    role: user.role,
    name: user.name,
    exp: Date.now() + 60 * 60 * 1000,
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
  if (signature !== expected) {
    throw new Error('Invalid token signature');
  }

  const payload = decode(encodedPayload);
  if (!payload.exp || payload.exp < Date.now()) {
    throw new Error('Token expired');
  }

  return payload;
}

module.exports = { signAccessToken, verifyAccessToken };
