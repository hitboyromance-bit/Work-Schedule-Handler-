const express = require('express');
const { login, bootstrap, createUser } = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');

const router = express.Router();

router.post('/login', login);
router.post('/bootstrap-manager', bootstrap);
router.post('/users', requireAuth, requireRole('manager'), createUser);

module.exports = router;
