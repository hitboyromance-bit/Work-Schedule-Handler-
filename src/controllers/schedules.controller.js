const asyncHandler = require('../utils/asyncHandler');
const Schedule = require('../models/Schedule');
const ApiError = require('../utils/ApiError');
const {
  validateDateRangeQuery,
  validatePaginationQuery,
  validateCreateScheduleBody,
  validateUpdateScheduleBody,
  validateScheduleId,
} = require('../validators/schedules.validator');

function buildDateFilter(from, to) {
  const filter = {};

  if (from) {
    filter.$gte = from;
  }

  if (to) {
    filter.$lte = to;
  }

  return Object.keys(filter).length > 0 ? filter : null;
}

async function findSchedulesWithPagination(query, page, limit, skip) {
  const [items, total] = await Promise.all([
    Schedule.find(query).sort({ date: 1, startTime: 1 }).skip(skip).limit(limit),
    Schedule.countDocuments(query),
  ]);

  return {
    schedules: items,
    meta: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
}

const getMySchedules = asyncHandler(async (req, res) => {
  const { from, to } = validateDateRangeQuery(req.query);
  const { page, limit, skip } = validatePaginationQuery(req.query);

  const query = {
    employeeId: req.user.employeeId,
  };

  const dateFilter = buildDateFilter(from, to);
  if (dateFilter) {
    query.date = dateFilter;
  }

  const result = await findSchedulesWithPagination(query, page, limit, skip);
  res.status(200).json(result);
});

const getSchedules = asyncHandler(async (req, res) => {
  const { from, to } = validateDateRangeQuery(req.query);
  const { page, limit, skip } = validatePaginationQuery(req.query);

  const query = {};

  if (req.query.employeeId) {
    query.employeeId = req.query.employeeId;
  }

  const dateFilter = buildDateFilter(from, to);
  if (dateFilter) {
    query.date = dateFilter;
  }

  const result = await findSchedulesWithPagination(query, page, limit, skip);
  res.status(200).json(result);
});

const createSchedule = asyncHandler(async (req, res) => {
  validateCreateScheduleBody(req.body);
  const { employeeId, date, startTime, endTime, location, notes } = req.body;

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
  validateScheduleId(req.params.id);
  validateUpdateScheduleBody(req.body);

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
  validateScheduleId(req.params.id);

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
