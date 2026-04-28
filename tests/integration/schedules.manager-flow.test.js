const test = require('node:test');
const assert = require('node:assert/strict');
const Schedule = require('../../src/models/Schedule');
const {
  createSchedule,
  updateSchedule,
  cancelSchedule,
} = require('../../src/controllers/schedules.controller');
const { requireRole } = require('../../src/middleware/requireRole');

function createMockRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

function runHandler(handler, req) {
  return new Promise((resolve) => {
    const res = createMockRes();
    handler(req, res, (err) => resolve({ err, res }));
    setImmediate(() => resolve({ err: null, res }));
  });
}

function runMiddleware(middleware, req = {}) {
  return new Promise((resolve) => {
    middleware(req, {}, (err) => resolve(err || null));
  });
}

test('worker is denied manager-only schedule routes by requireRole', async () => {
  const err = await runMiddleware(requireRole('manager'), { user: { role: 'worker' } });
  assert.ok(err);
  assert.equal(err.statusCode, 403);
});

test('manager can create schedule when no overlap exists', async () => {
  const originalFindOne = Schedule.findOne;
  const originalCreate = Schedule.create;

  Schedule.findOne = () => ({ lean: async () => null });
  Schedule.create = async (payload) => ({ _id: 'sched1', ...payload });

  const req = {
    user: { sub: 'manager-id' },
    body: {
      employeeId: 'W200',
      date: '2026-04-06',
      startTime: '09:00',
      endTime: '17:00',
      location: 'HQ',
    },
  };

  const { err, res } = await runHandler(createSchedule, req);

  Schedule.findOne = originalFindOne;
  Schedule.create = originalCreate;

  assert.equal(err, null);
  assert.equal(res.statusCode, 201);
  assert.equal(res.body.schedule.employeeId, 'W200');
});

test('manager schedule create returns conflict on overlap', async () => {
  const originalFindOne = Schedule.findOne;

  Schedule.findOne = () => ({ lean: async () => ({ _id: 'existing' }) });

  const req = {
    user: { sub: 'manager-id' },
    body: {
      employeeId: 'W200',
      date: '2026-04-06',
      startTime: '10:00',
      endTime: '18:00',
    },
  };

  const { err } = await runHandler(createSchedule, req);
  Schedule.findOne = originalFindOne;

  assert.ok(err);
  assert.equal(err.statusCode, 409);
  assert.equal(err.code, 'SCHEDULE_OVERLAP');
});

test('manager can update and cancel schedule', async () => {
  const originalFindById = Schedule.findById;
  const originalFindOne = Schedule.findOne;
  const originalFindByIdAndUpdate = Schedule.findByIdAndUpdate;

  Schedule.findById = async () => ({
    _id: '507f1f77bcf86cd799439011',
    employeeId: 'W200',
    date: new Date('2026-04-06T00:00:00.000Z'),
    startTime: '09:00',
    endTime: '17:00',
  });
  Schedule.findOne = () => ({ lean: async () => null });
  Schedule.findByIdAndUpdate = async (id, payload) => ({ _id: id, ...payload });

  const updateReq = {
    params: { id: '507f1f77bcf86cd799439011' },
    body: { notes: 'updated' },
  };
  const cancelReq = {
    params: { id: '507f1f77bcf86cd799439011' },
  };

  const updated = await runHandler(updateSchedule, updateReq);
  const cancelled = await runHandler(cancelSchedule, cancelReq);

  Schedule.findById = originalFindById;
  Schedule.findOne = originalFindOne;
  Schedule.findByIdAndUpdate = originalFindByIdAndUpdate;

  assert.equal(updated.err, null);
  assert.equal(updated.res.statusCode, 200);
  assert.equal(updated.res.body.schedule.notes, 'updated');

  assert.equal(cancelled.err, null);
  assert.equal(cancelled.res.statusCode, 200);
  assert.equal(cancelled.res.body.schedule.status, 'cancelled');
});

