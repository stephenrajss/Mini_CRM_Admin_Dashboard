import { Router } from 'express';

import { asyncHandler } from '../utils/asyncHandler.js';
import {
  companyLeadsSchema,
  createCompanySchema,
  listCompaniesSchema,
  updateCompanySchema,
} from '../validators/companyValidator.js';
import * as companyController from '../controllers/companyController.js';

import { authenticate } from '../middleware/authenticate.js';
import { authorizeRoles } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { validateObjectId } from '../middleware/validateObjectId.js';

const router = Router();

router.use(authenticate);
router.get('/options', asyncHandler(companyController.listCompanyOptions));
router.get('/', validate(listCompaniesSchema), asyncHandler(companyController.listCompanies));
router.post('/', authorizeRoles('admin'), validate(createCompanySchema), asyncHandler(companyController.createCompany));
router.get('/:id/leads', validateObjectId(), validate(companyLeadsSchema), asyncHandler(companyController.listCompanyLeads));
router.get('/:id', validateObjectId(), asyncHandler(companyController.getCompany));
router.patch(
  '/:id',
  authorizeRoles('admin'),
  validateObjectId(),
  validate(updateCompanySchema),
  asyncHandler(companyController.updateCompany),
);

export default router;
