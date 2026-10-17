import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    fileParallelism: false,
    hookTimeout: 120000,
    testTimeout: 30000,
    env: {
      NODE_ENV: 'test',
      PORT: '5000',
      MONGODB_URI: 'mongodb://127.0.0.1:27017/mini-crm-test',
      JWT_SECRET: 'test-secret-key-please-change',
      JWT_EXPIRES_IN: '1h',
      CLIENT_URL: 'http://localhost:5173',
      COOKIE_SECURE: 'false',
      COOKIE_SAME_SITE: 'lax',
      APP_TIMEZONE: 'UTC',
    },
  },
});
