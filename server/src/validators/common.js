import { z } from 'zod';

export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');

export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .max(120, 'Email is too long')
  .email('Enter a valid email address')
  .transform((value) => value.toLowerCase());

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be at most 72 characters')
  .regex(/[A-Za-z]/, 'Password must include a letter')
  .regex(/\d/, 'Password must include a number');

export const phoneSchema = z
  .string()
  .trim()
  .min(7, 'Phone must be at least 7 characters')
  .max(30, 'Phone is too long')
  .regex(/^[0-9+().\-\s]+$/, 'Enter a valid phone number');

export const phoneOrEmptySchema = z.union([z.literal(''), phoneSchema]);

export const websiteSchema = z
  .string()
  .trim()
  .max(200, 'Website is too long')
  .refine((value) => value === '' || /^https?:\/\/.+/i.test(value), {
    message: 'Website must start with http:// or https://',
  });

export function requiredText(label, max = 120) {
  return z.string().trim().min(1, `${label} is required`).max(max, `${label} is too long`);
}

export function optionalEnum(values) {
  return z
    .union([z.enum(values), z.literal('')])
    .optional()
    .transform((value) => value || undefined);
}

export const optionalQueryObjectId = z
  .union([objectIdSchema, z.literal('')])
  .optional()
  .transform((value) => value || undefined);

export function optionalNullableId() {
  return z
    .union([objectIdSchema, z.null(), z.literal('')])
    .optional()
    .transform((value) => {
      if (value === undefined) return undefined;
      if (value === null || value === '') return null;
      return value;
    });
}

export function listQuerySchema(sortFields, defaultSort = 'createdAt') {
  return z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z
      .string()
      .trim()
      .max(100)
      .optional()
      .transform((value) => value || undefined),
    sortBy: z.enum(sortFields).optional().default(defaultSort),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  });
}
