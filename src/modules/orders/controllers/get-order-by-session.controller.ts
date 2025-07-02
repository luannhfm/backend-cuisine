import { FastifyReply, FastifyRequest } from "fastify";
import { OrderService } from "../services/order.service";

export async function getOrderBySessionController(req: FastifyRequest, reply: FastifyReply) {
    const { sessionId } = req.params as { sessionId: string };
    const order = await OrderService.findBySession(sessionId);
  
    if (!order) return reply.status(404).send({ message: 'Order not found' });
  
    return reply.send(order);
  }