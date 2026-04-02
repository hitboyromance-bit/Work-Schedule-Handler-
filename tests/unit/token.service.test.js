const test = require('node:test');
const assert = require('node:assert/strict');
const { signAccessToken, verifyAccessToken } = require('../../src/services/token.service');

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
});

test('verifyAccessToken rejects tampered token', () => {
  const token = signAccessToken(user);
  const [payload, signature] = token.split('.');
  const tamperedSignature = signature.slice(0, -1) + (signature.endsWith('A') ? 'B' : 'A');

  assert.throws(() => verifyAccessToken(`${payload}.${tamperedSignature}`));
});
