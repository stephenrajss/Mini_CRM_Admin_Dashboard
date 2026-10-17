import { Router } from 'express';

import { asyncHandler } from '../utils/asyncHandler.js';
import { authenticate } from '../middleware/authenticate.js';
import { loginLimiter } from '../middleware/rateLimit.js';
import { loginSchema } from '../validators/authValidator.js';
import * as authController from '../controllers/authController.js';

import { validate } from '../middleware/validate.js';

const router = Router();

router.post('/login', loginLimiter, validate(loginSchema), asyncHandler(authController.login));
router.post('/logout', asyncHandler(authController.logout));
router.get('/me', authenticate, asyncHandler(authController.me));

export default router;
