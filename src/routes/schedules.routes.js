const express = require('express');
const {
  getMySchedules,
  getSchedules,
  createSchedule,
  updateSchedule,
  cancelSchedule,
} = require('../controllers/schedules.controller');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');

const router = express.Router();

router.get('/me', requireAuth, getMySchedules);
router.get('/', requireAuth, requireRole('manager'), getSchedules);
router.post('/', requireAuth, requireRole('manager'), createSchedule);
router.patch('/:id', requireAuth, requireRole('manager'), updateSchedule);
router.delete('/:id', requireAuth, requireRole('manager'), cancelSchedule);

module.exports = router;
