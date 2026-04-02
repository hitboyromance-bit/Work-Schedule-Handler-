const asyncHandler = require('../utils/asyncHandler');
const {
  validateLoginBody,
  validateCreateUserBody,
  validateBootstrapBody,
} = require('../validators/auth.validator');
const {
  loginWithEmployeeId,
  bootstrapManager,
  createUserAccount,
} = require('../services/auth.service');

const login = asyncHandler(async (req, res) => {
  validateLoginBody(req.body);
  const result = await loginWithEmployeeId(req.body.employeeId, req.body.password);
  res.status(200).json(result);
});

const bootstrap = asyncHandler(async (req, res) => {
  validateBootstrapBody(req.body);
  const result = await bootstrapManager(req.body);
  res.status(201).json(result);
});

const createUser = asyncHandler(async (req, res) => {
  validateCreateUserBody(req.body);
  const result = await createUserAccount(req.body);
  res.status(201).json(result);
});

module.exports = { login, bootstrap, createUser };
