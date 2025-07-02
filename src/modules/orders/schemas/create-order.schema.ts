import { z } from 'zod';

export const createOrderSchema = z.object({
  customerId: z.string().uuid(),
  items: z.array(z.object({
    productId: z.string(),
    name: z.string(),
    quantity: z.number().min(1),
    price: z.number()
  })),
  total: z.number()
});
