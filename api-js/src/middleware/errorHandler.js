const { AppError } = require('../errors/CustomErrors');

const errorHandler = (err, req, res, next) => {
  console.error('[Error]:', err.message || err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message
    });
  }

  // Handle Supabase/PostgREST errors generically if they bubble up
  if (err.code) {
    if (err.code === '23505') { // unique violation
      return res.status(409).json({ status: 'error', message: 'Resource already exists' });
    }
  }

  return res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
};

module.exports = errorHandler;
