import rateLimit from 'express-rate-limit';
import { getEnv } from '../config/env.js';

function buildLimiter({ windowMs, max, message }) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => getEnv().NODE_ENV === 'test',
    handler: (_req, res) => {
      res.status(429).json({
        success: false,
        message,
        errors: [],
      });
    },
  });
}

export const loginLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many login attempts. Please try again later.',
});

export const sensitiveLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Too many requests. Please try again later.',
});
