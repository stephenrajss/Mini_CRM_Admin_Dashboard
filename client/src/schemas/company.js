import { z } from 'zod';

export const companyFormSchema = z.object({
  name: z.string().trim().min(1, 'Company name is required').max(120, 'Company name is too long'),
  industry: z.string().trim().min(1, 'Industry is required').max(80, 'Industry is too long'),
  location: z.string().trim().min(1, 'Location is required').max(120, 'Location is too long'),
  website: z
    .string()
    .trim()
    .max(200, 'Website is too long')
    .refine((value) => value === '' || /^https?:\/\/.+/i.test(value), 'Website must start with http:// or https://'),
  phone: z
    .string()
    .trim()
    .max(30)
    .refine((value) => value === '' || /^[0-9+().\-\s]{7,30}$/.test(value), 'Enter a valid phone number'),
  description: z.string().trim().max(1000, 'Description is too long'),
});
