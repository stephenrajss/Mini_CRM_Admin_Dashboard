import { Router } from 'express';

import { asyncHandler } from '../utils/asyncHandler.js';
import { isAdmin } from '../utils/access.js';
import {
  createLeadSchema,
  listLeadsSchema,
  updateLeadSchema,
  updateLeadStatusSchema,
  updateOwnLeadSchema,
} from '../validators/leadValidator.js';
import * as leadController from '../controllers/leadController.js';

import { authenticate } from '../middleware/authenticate.js';
import { authorizeRoles } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { validateObjectId } from '../middleware/validateObjectId.js';

const router = Router();

router.use(authenticate);
router.get('/options', asyncHandler(leadController.listLeadOptions));
router.get('/', validate(listLeadsSchema), asyncHandler(leadController.listLeads));
router.post('/', authorizeRoles('admin'), validate(createLeadSchema), asyncHandler(leadController.createLead));
router.get('/:id', validateObjectId(), asyncHandler(leadController.getLead));
router.patch('/:id/status', validateObjectId(), validate(updateLeadStatusSchema), asyncHandler(leadController.updateLeadStatus));
router.patch(
  '/:id',
  validateObjectId(),
  (req, res, next) => validate(isAdmin(req.user) ? updateLeadSchema : updateOwnLeadSchema)(req, res, next),
  asyncHandler(leadController.updateLead),
);
router.delete('/:id', authorizeRoles('admin'), validateObjectId(), asyncHandler(leadController.deleteLead));

export default router;
