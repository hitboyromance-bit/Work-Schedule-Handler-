const asyncHandler = require('../utils/asyncHandler');
const Schedule = require('../models/Schedule');
const ApiError = require('../utils/ApiError');

function buildDateFilter(from, to) {
  const filter = {};

  if (from) {
    filter.$gte = new Date(from);
  }

  if (to) {
    filter.$lte = new Date(to);
  }

  return Object.keys(filter).length > 0 ? filter : null;
}

const getMySchedules = asyncHandler(async (req, res) => {
  const dateFilter = buildDateFilter(req.query.from, req.query.to);
  const query = {
    employeeId: req.user.employeeId,
  };

  if (dateFilter) {
    query.date = dateFilter;
  }

  const schedules = await Schedule.find(query).sort({ date: 1, startTime: 1 });
  res.status(200).json({ schedules });
});

const getSchedules = asyncHandler(async (req, res) => {
  const dateFilter = buildDateFilter(req.query.from, req.query.to);
  const query = {};

  if (req.query.employeeId) {
    query.employeeId = req.query.employeeId;
  }

  if (dateFilter) {
    query.date = dateFilter;
  }

  const schedules = await Schedule.find(query).sort({ date: 1, startTime: 1 });
  res.status(200).json({ schedules });
});

const createSchedule = asyncHandler(async (req, res) => {
  const { employeeId, date, startTime, endTime, location, notes } = req.body || {};

  if (!employeeId || !date || !startTime || !endTime) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'employeeId, date, startTime, and endTime are required.');
  }

  const schedule = await Schedule.create({
    employeeId,
    date,
    startTime,
    endTime,
    location,
    notes,
    createdBy: req.user.sub,
  });

  res.status(201).json({ schedule });
});

const updateSchedule = asyncHandler(async (req, res) => {
  const schedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!schedule) {
    throw new ApiError(404, 'SCHEDULE_NOT_FOUND', 'Schedule not found.');
  }

  res.status(200).json({ schedule });
});

const cancelSchedule = asyncHandler(async (req, res) => {
  const schedule = await Schedule.findByIdAndUpdate(
    req.params.id,
    { status: 'cancelled' },
    { new: true }
  );

  if (!schedule) {
    throw new ApiError(404, 'SCHEDULE_NOT_FOUND', 'Schedule not found.');
  }

  res.status(200).json({ schedule });
});

module.exports = {
  getMySchedules,
  getSchedules,
  createSchedule,
  updateSchedule,
  cancelSchedule,
};
