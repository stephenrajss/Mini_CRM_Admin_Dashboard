import { Router } from 'express';

import { asyncHandler } from '../utils/asyncHandler.js';

import { authenticate } from '../middleware/authenticate.js';
import { authorizeRoles } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { validateObjectId } from '../middleware/validateObjectId.js';
import { sensitiveLimiter } from '../middleware/rateLimit.js';

import {
  createUserSchema,
  listUsersSchema,
  setActiveSchema,
  updateUserSchema,
} from '../validators/userValidator.js';
import * as userController from '../controllers/userController.js';

const router = Router();

router.use(authenticate);
router.get('/options', asyncHandler(userController.listUserOptions));
router.get('/', authorizeRoles('admin'), validate(listUsersSchema), asyncHandler(userController.listUsers));
router.post(
  '/',
  sensitiveLimiter,
  authorizeRoles('admin'),
  validate(createUserSchema),
  asyncHandler(userController.createUser),
);
router.get('/:id', authorizeRoles('admin'), validateObjectId(), asyncHandler(userController.getUser));
router.patch(
  '/:id/active',
  authorizeRoles('admin'),
  validateObjectId(),
  validate(setActiveSchema),
  asyncHandler(userController.setUserActive),
);
router.patch(
  '/:id',
  authorizeRoles('admin'),
  validateObjectId(),
  validate(updateUserSchema),
  asyncHandler(userController.updateUser),
);

export default router;
