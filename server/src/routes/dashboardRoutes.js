import { Router } from 'express';

import { asyncHandler } from '../utils/asyncHandler.js';
import * as dashboardController from '../controllers/dashboardController.js';

import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.use(authenticate);
router.get('/summary', asyncHandler(dashboardController.getSummary));
router.get('/leads-by-status', asyncHandler(dashboardController.getLeadsByStatus));
router.get('/recent-activity', asyncHandler(dashboardController.getRecentActivity));

export default router;
