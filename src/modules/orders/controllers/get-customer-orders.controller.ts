// src/modules/orders/controllers/get-customer-orders.controller.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { OrderService } from '../services/order.service';

export async function getCustomerOrdersController(request: FastifyRequest, reply: FastifyReply) {
  const { customerId } = request.params as { customerId: string };
  const orders = await OrderService.findByCustomer(customerId);
  return reply.send(orders);
}
