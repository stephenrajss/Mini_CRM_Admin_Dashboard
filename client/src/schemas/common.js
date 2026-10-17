import { z } from 'zod';

export const emailField = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .email('Enter a valid email address')
  .max(120, 'Email is too long');

export const passwordField = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be at most 72 characters')
  .regex(/[A-Za-z]/, 'Password must include a letter')
  .regex(/\d/, 'Password must include a number');

export const phoneField = z
  .string()
  .trim()
  .min(7, 'Phone must be at least 7 characters')
  .max(30, 'Phone is too long')
  .regex(/^[0-9+().\-\s]+$/, 'Enter a valid phone number');
