import { FastifyRequest, FastifyReply } from 'fastify';
import { CustomerService } from '../services/customer.service';

export async function getAllCustomersController(request: FastifyRequest, reply: FastifyReply) {
  const customers = await CustomerService.findAll();
  return reply.send(customers);
}
