import { z } from 'zod';
import { FastifyRequest, FastifyReply } from 'fastify';
import { AppDataSource } from '../../../config/database';
import { Customer } from '../entities/entities';

const updateCustomerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  birthDate: z.string(),
  address: z.string().min(1),
  email: z.string().email()
});

export async function updateCustomerController(request: FastifyRequest, reply: FastifyReply) {
  const customerId = (request.params as any).id;
  const body = updateCustomerSchema.parse(request.body);

  const repo = AppDataSource.getRepository(Customer);

  const customer = await repo.findOneBy({ id: customerId });
  if (!customer) return reply.status(404).send({ message: 'Customer not found' });

  Object.assign(customer, body);
  await repo.save(customer);
  return reply.send({ message: 'Customer updated successfully' });
}