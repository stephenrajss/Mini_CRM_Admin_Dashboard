import { describe, expect, it } from 'vitest';
import { leadFormSchema } from '../schemas/lead';

describe('lead form schema', () => {
  it('rejects an invalid email and short phone number', () => {
    const result = leadFormSchema.safeParse({
      name: 'Ava',
      email: 'not-an-email',
      phone: '123',
      status: 'new',
      assignedTo: 'abc',
      company: '',
      notes: '',
    });
    expect(result.success).toBe(false);
  });
});
