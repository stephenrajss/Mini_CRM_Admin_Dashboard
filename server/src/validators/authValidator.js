import { z } from 'zod';
import { emailSchema } from './common.js';

export const loginSchema = z.object({
  body: z
    .object({
      email: emailSchema,
      password: z.string().min(1, 'Password is required').max(72, 'Password is too long'),
    })
    .strict(),
});
