import { z } from 'zod';
import { LEAD_SORT_FIELDS, LEAD_STATUSES } from '../config/constants.js';
import {
  emailSchema,
  listQuerySchema,
  objectIdSchema,
  optionalEnum,
  optionalNullableId,
  optionalQueryObjectId,
  phoneSchema,
  requiredText,
} from './common.js';

const notesSchema = z.string().trim().max(2000, 'Notes are too long');

export const listLeadsSchema = z.object({
  query: listQuerySchema(LEAD_SORT_FIELDS).extend({
    status: optionalEnum(LEAD_STATUSES),
    assignedTo: optionalQueryObjectId,
    company: optionalQueryObjectId,
  }),
});

export const createLeadSchema = z.object({
  body: z
    .object({
      name: requiredText('Name'),
      email: emailSchema,
      phone: phoneSchema,
      status: z.enum(LEAD_STATUSES).default('new'),
      assignedTo: objectIdSchema,
      company: optionalNullableId(),
      notes: notesSchema.optional().default(''),
    })
    .strict(),
});

const leadUpdateShape = {
  name: requiredText('Name').optional(),
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  status: z.enum(LEAD_STATUSES).optional(),
  company: optionalNullableId(),
  notes: notesSchema.optional(),
};

function atLeastOneField(data) {
  return Object.values(data).some((value) => value !== undefined);
}

export const updateLeadSchema = z.object({
  body: z
    .object({
      ...leadUpdateShape,
      assignedTo: objectIdSchema.optional(),
    })
    .strict()
    .refine(atLeastOneField, {
      message: 'At least one field is required',
      path: ['body'],
    }),
});

export const updateOwnLeadSchema = z.object({
  body: z.object(leadUpdateShape).strict().refine(atLeastOneField, {
    message: 'At least one field is required',
    path: ['body'],
  }),
});

export const updateLeadStatusSchema = z.object({
  body: z
    .object({
      status: z.enum(LEAD_STATUSES),
    })
    .strict(),
});
