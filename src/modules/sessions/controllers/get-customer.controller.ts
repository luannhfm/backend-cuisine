import { FastifyRequest, FastifyReply } from 'fastify';
import { AppDataSource } from '../../../config/database';
import { Customer } from '../entities/entities';

export async function getCustomerController(request: FastifyRequest, reply: FastifyReply) {
  const customerId = (request.params as any).id;
  const customerRepo = AppDataSource.getRepository(Customer);
  const customer = await customerRepo.findOneBy({ id: customerId });

  if (!customer) {
    return reply.status(404).send({ message: 'Customer not found' });
  }

  delete customer.password;
  return reply.send(customer);
}