import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { getEnv } from './config/env.js';
import apiRoutes from './routes/index.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

export function createApp() {
  const env = getEnv();
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(cors({
    origin(origin, callback) {
      if (!origin || env.origins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
  }));
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());

  app.get('/', (_req, res) => {
    res.json({
      success: true,
      message: 'Mini CRM API',
      data: { health: '/api/health' },
    });
  });

  app.use('/api', apiRoutes);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
