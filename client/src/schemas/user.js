import { z } from 'zod';
import { emailField, passwordField } from './common';

const base = {
  name: z.string().trim().min(1, 'Name is required').max(80, 'Name is too long'),
  email: emailField,
  role: z.enum(['admin', 'user']),
};

export const createUserSchema = z.object({
  ...base,
  password: passwordField,
});

export const updateUserSchema = z.object({
  ...base,
  password: z.union([z.literal(''), passwordField]),
});
