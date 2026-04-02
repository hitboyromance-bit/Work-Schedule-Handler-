const test = require('node:test');
const assert = require('node:assert/strict');
const { validateLoginBody } = require('../../src/validators/auth.validator');

test('validateLoginBody accepts valid payload', () => {
  assert.doesNotThrow(() => validateLoginBody({ employeeId: 'E123', password: 'pw' }));
});

test('validateLoginBody rejects invalid payload', () => {
  assert.throws(() => validateLoginBody({ employeeId: 123, password: null }));
  assert.throws(() => validateLoginBody(null));
});
