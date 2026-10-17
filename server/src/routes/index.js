import { Router } from 'express';
import mongoose from 'mongoose';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import companyRoutes from './companyRoutes.js';
import leadRoutes from './leadRoutes.js';
import taskRoutes from './taskRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';

const router = Router();

router.get('/health', (_req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({
    success: connected,
    message: connected ? 'Service is healthy' : 'Database is unavailable',
    data: {
      status: connected ? 'ok' : 'degraded',
      database: connected ? 'connected' : 'disconnected',
      uptime: Math.round(process.uptime()),
    },
  });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/companies', companyRoutes);
router.use('/leads', leadRoutes);
router.use('/tasks', taskRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
