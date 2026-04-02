const test = require('node:test');
const assert = require('node:assert/strict');
const { signAccessToken, verifyAccessToken, parseExpiresIn } = require('../../src/services/token.service');

const user = {
  _id: { toString: () => '507f1f77bcf86cd799439011' },
  employeeId: 'E123',
  role: 'worker',
  name: 'Test Worker',
};

test('signAccessToken and verifyAccessToken roundtrip', () => {
  const token = signAccessToken(user);
  const payload = verifyAccessToken(token);

  assert.equal(payload.sub, '507f1f77bcf86cd799439011');
  assert.equal(payload.employeeId, 'E123');
  assert.equal(payload.role, 'worker');
  assert.equal(payload.name, 'Test Worker');
  assert.equal(typeof payload.iat, 'number');
  assert.equal(typeof payload.exp, 'number');
});

test('verifyAccessToken rejects tampered token', () => {
  const token = signAccessToken(user);
  const [payload, signature] = token.split('.');
  const tamperedSignature = signature.slice(0, -1) + (signature.endsWith('A') ? 'B' : 'A');

  assert.throws(() => verifyAccessToken(`${payload}.${tamperedSignature}`));
});

test('parseExpiresIn supports ms/s/m/h/d and fallback', () => {
  assert.equal(parseExpiresIn('1500ms'), 1500);
  assert.equal(parseExpiresIn('30s'), 30000);
  assert.equal(parseExpiresIn('5m'), 300000);
  assert.equal(parseExpiresIn('2h'), 7200000);
  assert.equal(parseExpiresIn('1d'), 86400000);
  assert.equal(parseExpiresIn('invalid'), 3600000);
});
