// src/modules/orders/controllers/create-order.controller.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { createOrderSchema } from '../schemas/create-order.schema';
import { OrderService } from '../services/order.service';

export async function createOrderController(request: FastifyRequest, reply: FastifyReply) {
  const parsed = createOrderSchema.safeParse(request.body);

  if (!parsed.success) {
    return reply.status(400).send({ error: 'Invalid request', issues: parsed.error.format() });
  }

  const data = parsed.data as {
    customerId: string;
    items: {
      productId: string;
      name: string;
      quantity: number;
      price: number;
    }[];
    total: number;
  };

  const order = await OrderService.create({
    ...data,
    status: 'pending'
  });

  return reply.status(201).send(order);
}
