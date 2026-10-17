import { getEnv } from '../config/env.js';

const DUPLICATE_FIELD_LABELS = {
  email: 'email',
  nameNormalized: 'name',
};

export function errorHandler(err, _req, res, _next) {
  let status = err.statusCode || err.status || 500;
  let message = err.message || 'Internal server error';
  let errors = Array.isArray(err.errors) ? err.errors : [];

  if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Invalid JSON body';
    errors = [];
  } else if (err.type === 'entity.too.large') {
    status = 413;
    message = 'Request body is too large';
    errors = [];
  } else if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid id';
    errors = [];
  } else if (err.name === 'ValidationError') {
    status = 422;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((item) => ({
      field: item.path,
      message: item.message,
    }));
  } else if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyPattern || err.keyValue || {})[0] || 'value';
    const label = DUPLICATE_FIELD_LABELS[field] || field;
    message = `A record with that ${label} already exists`;
    errors = [{ field: label, message }];
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    status = 401;
    message = 'Invalid or expired token';
    errors = [];
  }

  const isProd = getEnv().NODE_ENV === 'production';
  if (status >= 500) {
    if (isProd) {
      message = 'Internal server error';
      errors = [];
    } else if (getEnv().NODE_ENV !== 'test') {
      console.error(err);
    }
  }

  res.status(status).json({
    success: false,
    message,
    errors,
  });
}
