const jwt = require('jsonwebtoken');

/**
 * Signs a JWT for the given user payload.
 * Keep the payload minimal (id, uuid, role) - never put sensitive data in the token,
 * since it's only base64-encoded, not encrypted.
 */
function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h'
  });
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = { signToken, verifyToken };
