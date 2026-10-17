import { z } from 'zod';
import { COMPANY_SORT_FIELDS } from '../config/constants.js';
import {
  listQuerySchema,
  phoneOrEmptySchema,
  requiredText,
  websiteSchema,
} from './common.js';

const descriptionSchema = z.string().trim().max(1000, 'Description is too long');

export const listCompaniesSchema = z.object({
  query: listQuerySchema(COMPANY_SORT_FIELDS),
});

export const createCompanySchema = z.object({
  body: z
    .object({
      name: requiredText('Company name', 120),
      industry: requiredText('Industry', 80),
      location: requiredText('Location', 120),
      website: websiteSchema.optional().default(''),
      phone: phoneOrEmptySchema.optional().default(''),
      description: descriptionSchema.optional().default(''),
    })
    .strict(),
});

export const updateCompanySchema = z.object({
  body: z
    .object({
      name: requiredText('Company name', 120).optional(),
      industry: requiredText('Industry', 80).optional(),
      location: requiredText('Location', 120).optional(),
      website: websiteSchema.optional(),
      phone: phoneOrEmptySchema.optional(),
      description: descriptionSchema.optional(),
    })
    .strict()
    .refine((data) => Object.values(data).some((value) => value !== undefined), {
      message: 'At least one field is required',
      path: ['body'],
    }),
});

export const companyLeadsSchema = z.object({
  query: listQuerySchema(['name', 'email', 'status', 'createdAt']),
});
