const test = require('node:test');
const assert = require('node:assert/strict');
const { hashPassword, verifyPassword } = require('../../src/services/password.service');

test('hashPassword generates scrypt formatted value', () => {
  const hashed = hashPassword('my-password');
  assert.equal(hashed.startsWith('scrypt$'), true);
  assert.equal(hashed.split('$').length, 3);
});

test('verifyPassword validates correct password and rejects invalid password', () => {
  const hashed = hashPassword('my-password');
  assert.equal(verifyPassword('my-password', hashed), true);
  assert.equal(verifyPassword('wrong-password', hashed), false);
});

test('verifyPassword supports legacy plaintext fallback', () => {
  assert.equal(verifyPassword('plain', 'plain'), true);
  assert.equal(verifyPassword('nope', 'plain'), false);
});
