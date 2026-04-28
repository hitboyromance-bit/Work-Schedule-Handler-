const crypto = require('crypto');

const KEY_LENGTH = 64;
const COST = 16384;
const BLOCK_SIZE = 8;
const PARALLELIZATION = 1;

function hashPassword(plainPassword) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .scryptSync(plainPassword, salt, KEY_LENGTH, {
      N: COST,
      r: BLOCK_SIZE,
      p: PARALLELIZATION,
    })
    .toString('hex');

  return `scrypt$${salt}$${hash}`;
}

function verifyPassword(plainPassword, storedValue) {
  if (!storedValue || typeof storedValue !== 'string') {
    return false;
  }

  if (!storedValue.startsWith('scrypt$')) {
    return plainPassword === storedValue;
  }

  const [, salt, hash] = storedValue.split('$');
  if (!salt || !hash) {
    return false;
  }

  const derived = crypto
    .scryptSync(plainPassword, salt, KEY_LENGTH, {
      N: COST,
      r: BLOCK_SIZE,
      p: PARALLELIZATION,
    })
    .toString('hex');

  const a = Buffer.from(derived, 'hex');
  const b = Buffer.from(hash, 'hex');

  if (a.length !== b.length) {
    return false;
  }

  return crypto.timingSafeEqual(a, b);
}

module.exports = { hashPassword, verifyPassword };
