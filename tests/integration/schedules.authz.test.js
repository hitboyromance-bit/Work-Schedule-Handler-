const test = require('node:test');
const assert = require('node:assert/strict');
const { requireRole } = require('../../src/middleware/requireRole');

function runMiddleware(middleware, req = {}) {
  return new Promise((resolve) => {
    middleware(req, {}, (err) => resolve(err || null));
  });
}

test('manager can access manager-only middleware guard', async () => {
  const err = await runMiddleware(requireRole('manager'), {
    user: { role: 'manager' },
  });

  assert.equal(err, null);
});

test('worker is blocked from manager-only middleware guard', async () => {
  const err = await runMiddleware(requireRole('manager'), {
    user: { role: 'worker' },
  });

  assert.ok(err);
  assert.equal(err.statusCode, 403);
  assert.equal(err.code, 'AUTH_FORBIDDEN');
});
