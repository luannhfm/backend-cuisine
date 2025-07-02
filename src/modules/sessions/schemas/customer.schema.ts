import { z } from 'zod';

export const createCustomerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  birthDate: z.string(), // formato: YYYY-MM-DD
  address: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6)
});

export const loginCustomerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});
