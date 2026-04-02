const asyncHandler = require('../utils/asyncHandler');
const { validateLoginBody } = require('../validators/auth.validator');
const { loginWithEmployeeId } = require('../services/auth.service');

const login = asyncHandler(async (req, res) => {
  validateLoginBody(req.body);

  const result = await loginWithEmployeeId(req.body.employeeId, req.body.password);

  res.status(200).json(result);
});

module.exports = { login };
