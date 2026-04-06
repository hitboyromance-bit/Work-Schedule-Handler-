const test = require('node:test');
const assert = require('node:assert/strict');
const {
  validateDateRangeQuery,
  validatePaginationQuery,
  validateCreateScheduleBody,
  validateUpdateScheduleBody,
  validateScheduleId,
} = require('../../src/validators/schedules.validator');

test('validateDateRangeQuery accepts valid dates and rejects reversed range', () => {
  const result = validateDateRangeQuery({ from: '2026-04-01', to: '2026-04-03' });
  assert.ok(result.from instanceof Date);
  assert.ok(result.to instanceof Date);
  assert.throws(() => validateDateRangeQuery({ from: '2026-04-04', to: '2026-04-03' }));
});

test('validatePaginationQuery validates bounds', () => {
  const result = validatePaginationQuery({ page: '2', limit: '10' });
  assert.equal(result.page, 2);
  assert.equal(result.limit, 10);
  assert.equal(result.skip, 10);
  assert.throws(() => validatePaginationQuery({ page: '0' }));
  assert.throws(() => validatePaginationQuery({ limit: '101' }));
});

test('validateCreateScheduleBody validates required fields and times', () => {
  assert.doesNotThrow(() =>
    validateCreateScheduleBody({
      employeeId: 'E1',
      date: '2026-04-10',
      startTime: '09:00',
      endTime: '17:00',
    })
  );

  assert.throws(() =>
    validateCreateScheduleBody({
      employeeId: 'E1',
      date: '2026-04-10',
      startTime: '17:00',
      endTime: '09:00',
    })
  );
});

test('validateUpdateScheduleBody and validateScheduleId enforce field rules', () => {
  assert.doesNotThrow(() => validateUpdateScheduleBody({ notes: 'updated', status: 'cancelled' }));
  assert.throws(() => validateUpdateScheduleBody({ employeeId: 'E2' }));
  assert.doesNotThrow(() => validateScheduleId('507f1f77bcf86cd799439011'));
  assert.throws(() => validateScheduleId('bad-id'));
});
