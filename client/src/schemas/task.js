import { z } from 'zod';

export const taskFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(140, 'Title is too long'),
  description: z.string().max(2000, 'Description is too long').optional(),
  lead: z.string().min(1, 'Lead is required'),
  assignedTo: z.string().min(1, 'Assigned user is required'),
  dueDate: z.string().min(1, 'Due date is required'),
});
