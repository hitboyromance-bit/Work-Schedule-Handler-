const test = require('node:test');
const assert = require('node:assert/strict');
const {
  validateLoginBody,
  validateCreateUserBody,
  validateBootstrapBody,
} = require('../../src/validators/auth.validator');

test('validateLoginBody accepts valid payload', () => {
  assert.doesNotThrow(() => validateLoginBody({ employeeId: 'E123', password: 'password123' }));
});

test('validateLoginBody rejects invalid payload', () => {
  assert.throws(() => validateLoginBody({ employeeId: 123, password: null }));
  assert.throws(() => validateLoginBody(null));
});

test('validateCreateUserBody enforces role and password policy', () => {
  assert.doesNotThrow(() =>
    validateCreateUserBody({ employeeId: 'E200', name: 'Ada', password: 'password123', role: 'worker' })
  );

  assert.throws(() =>
    validateCreateUserBody({ employeeId: 'E200', name: 'Ada', password: '123', role: 'worker' })
  );

  assert.throws(() =>
    validateCreateUserBody({ employeeId: 'E200', name: 'Ada', password: 'password123', role: 'admin' })
  );
});

test('validateBootstrapBody enforces manager bootstrap payload', () => {
  assert.doesNotThrow(() =>
    validateBootstrapBody({ employeeId: 'M100', name: 'Manager', password: 'password123' })
  );

  assert.throws(() =>
    validateBootstrapBody({ employeeId: 'M100', name: 'Manager', password: 'short' })
  );
});
