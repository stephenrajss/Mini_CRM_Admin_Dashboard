import { Router } from 'express';

import { asyncHandler } from '../utils/asyncHandler.js';
import {
  createTaskSchema,
  listTasksSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
} from '../validators/taskValidator.js';
import * as taskController from '../controllers/taskController.js';

import { authenticate } from '../middleware/authenticate.js';
import { authorizeRoles } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { validateObjectId } from '../middleware/validateObjectId.js';

const router = Router();

router.use(authenticate);
router.get('/', validate(listTasksSchema), asyncHandler(taskController.listTasks));
router.post('/', authorizeRoles('admin'), validate(createTaskSchema), asyncHandler(taskController.createTask));
router.get('/:id', validateObjectId(), asyncHandler(taskController.getTask));
router.patch('/:id/status', validateObjectId(), validate(updateTaskStatusSchema), asyncHandler(taskController.updateTaskStatus));
router.patch(
  '/:id',
  authorizeRoles('admin'),
  validateObjectId(),
  validate(updateTaskSchema),
  asyncHandler(taskController.updateTask),
);
router.delete('/:id', authorizeRoles('admin'), validateObjectId(), asyncHandler(taskController.deleteTask));

export default router;
