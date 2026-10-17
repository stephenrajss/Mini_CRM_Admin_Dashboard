import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  JWT_EXPIRES_IN: z.string().regex(/^\d+(s|m|h|d)$/, 'JWT_EXPIRES_IN must look like 8h, 30m, or 1d').default('8h'),
  CLIENT_URL: z.string().min(1).default('http://localhost:5173'),
  COOKIE_SECURE: z.enum(['true', 'false']).default('false'),
  COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).default('lax'),
  APP_TIMEZONE: z.string().min(1).default('UTC'),
  ADMIN_NAME: z.string().optional(),
  ADMIN_EMAIL: z.string().optional(),
  ADMIN_PASSWORD: z.string().optional(),
  SEED_USER_PASSWORD: z.string().optional(),
});

let cached;

export function getEnv() {
  if (cached) return cached;

  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${details}`);
  }

  const data = parsed.data;
  const origins = data.CLIENT_URL.split(',').map((origin) => origin.trim()).filter(Boolean);
  for (const origin of origins) {
    try {
      new URL(origin);
    } catch {
      throw new Error(`Invalid CLIENT_URL origin: ${origin}`);
    }
  }

  try {
    Intl.DateTimeFormat('en-US', { timeZone: data.APP_TIMEZONE }).format(new Date());
  } catch {
    throw new Error(`Invalid APP_TIMEZONE: ${data.APP_TIMEZONE}`);
  }

  if (data.COOKIE_SAME_SITE === 'none' && data.COOKIE_SECURE !== 'true') {
    throw new Error('COOKIE_SAME_SITE=none requires COOKIE_SECURE=true');
  }

  if (data.NODE_ENV === 'production' && /replace-with|change-me|test-secret/i.test(data.JWT_SECRET)) {
    throw new Error('JWT_SECRET is not safe for production');
  }

  cached = {
    ...data,
    origins,
    cookieSecure: data.COOKIE_SECURE === 'true',
  };
  return cached;
}

export function resetEnvCache() {
  cached = undefined;
}
