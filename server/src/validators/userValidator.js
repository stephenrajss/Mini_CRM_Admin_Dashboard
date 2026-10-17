import { z } from 'zod';
import { USER_ROLES, USER_SORT_FIELDS } from '../config/constants.js';
import { emailSchema, listQuerySchema, passwordSchema, requiredText } from './common.js';

export const listUsersSchema = z.object({
  query: listQuerySchema(USER_SORT_FIELDS).extend({
    role: z.union([z.enum(USER_ROLES), z.literal('')]).optional().transform((value) => value || undefined),
    isActive: z
      .union([z.enum(['true', 'false']), z.literal('')])
      .optional()
      .transform((value) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        return undefined;
      }),
  }),
});

export const createUserSchema = z.object({
  body: z
    .object({
      name: requiredText('Name', 80),
      email: emailSchema,
      password: passwordSchema,
      role: z.enum(USER_ROLES).default('user'),
    })
    .strict(),
});

export const updateUserSchema = z.object({
  body: z
    .object({
      name: requiredText('Name', 80).optional(),
      email: emailSchema.optional(),
      password: passwordSchema.optional(),
      role: z.enum(USER_ROLES).optional(),
    })
    .strict()
    .refine((data) => Object.values(data).some((value) => value !== undefined), {
      message: 'At least one field is required',
      path: ['body'],
    }),
});

export const setActiveSchema = z.object({
  body: z
    .object({
      isActive: z.boolean(),
    })
    .strict(),
});
