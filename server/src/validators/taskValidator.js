import { z } from 'zod';
import { DUE_FILTERS, TASK_SORT_FIELDS, TASK_STATUSES } from '../config/constants.js';
import {
  listQuerySchema,
  objectIdSchema,
  optionalEnum,
  optionalQueryObjectId,
  requiredText,
} from './common.js';

const dueDateSchema = z.coerce.date({
  errorMap: () => ({ message: 'Enter a valid due date' }),
});

export const listTasksSchema = z.object({
  query: listQuerySchema(TASK_SORT_FIELDS).extend({
    status: optionalEnum(TASK_STATUSES),
    assignedTo: optionalQueryObjectId,
    lead: optionalQueryObjectId,
    due: optionalEnum(DUE_FILTERS),
  }),
});

export const createTaskSchema = z.object({
  body: z
    .object({
      title: requiredText('Title', 140),
      description: z.string().trim().max(2000, 'Description is too long').optional().default(''),
      lead: objectIdSchema,
      assignedTo: objectIdSchema,
      dueDate: dueDateSchema,
      status: z.enum(TASK_STATUSES).optional().default('pending'),
    })
    .strict(),
});

export const updateTaskSchema = z.object({
  body: z
    .object({
      title: requiredText('Title', 140).optional(),
      description: z.string().trim().max(2000, 'Description is too long').optional(),
      lead: objectIdSchema.optional(),
      assignedTo: objectIdSchema.optional(),
      dueDate: dueDateSchema.optional(),
      status: z.enum(TASK_STATUSES).optional(),
    })
    .strict()
    .refine((data) => Object.values(data).some((value) => value !== undefined), {
      message: 'At least one field is required',
      path: ['body'],
    }),
});

export const updateTaskStatusSchema = z.object({
  body: z
    .object({
      status: z.enum(TASK_STATUSES),
    })
    .strict(),
});
