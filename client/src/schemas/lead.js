import { z } from 'zod';
import { emailField, phoneField } from './common';

export const leadFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120, 'Name is too long'),
  email: emailField,
  phone: phoneField,
  status: z.enum(['new', 'contacted', 'qualified', 'lost']),
  assignedTo: z.string().min(1, 'Assigned user is required'),
  company: z.string().optional(),
  notes: z.string().max(2000, 'Notes are too long').optional(),
});
