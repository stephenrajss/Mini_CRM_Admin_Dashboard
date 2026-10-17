import mongoose from 'mongoose';
import { createApp } from './app.js';
import connectDB from './config/db.js';
import { getEnv } from './config/env.js';

const env = getEnv();
const app = createApp();

try {
  await connectDB();
} catch (error) {
  console.error('Failed to connect to MongoDB.');
  console.error(error.message);
  process.exit(1);
}

const server = app.listen(env.PORT, () => {
  console.log(`Mini CRM API listening on port ${env.PORT}`);
});

function shutdown(signal) {
  console.log(`${signal} received, shutting down`);
  server.close(async () => {
    await mongoose.disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
