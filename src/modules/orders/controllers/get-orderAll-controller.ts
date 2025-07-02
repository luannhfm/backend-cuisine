// src/modules/orders/controllers/get-all-orders.controller.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { OrderService } from '../services/order.service';

export async function getAllOrdersController(request: FastifyRequest, reply: FastifyReply) {
  const orders = await OrderService.findAll();
  return reply.send(orders);
}
