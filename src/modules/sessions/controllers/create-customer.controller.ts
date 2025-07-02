import { FastifyRequest, FastifyReply } from 'fastify';
import { AppDataSource } from '../../../config/database';
import { Customer } from '../entities/entities';
import { createCustomerSchema } from '../schemas/customer.schema';
import bcrypt from 'bcrypt';

export async function createCustomerController(request: FastifyRequest, reply: FastifyReply) {
  const body = createCustomerSchema.parse(request.body);

  const customerRepository = AppDataSource.getRepository(Customer);

  const existing = await customerRepository.findOneBy({ email: body.email });
  if (existing) {
    return reply.status(400).send({ message: 'Email already in use' });
  }

  const passwordHash = await bcrypt.hash(body.password, 10);

  const customer = customerRepository.create({ ...body, password: passwordHash });
  await customerRepository.save(customer);

  return reply.status(201).send({ message: 'Customer created successfully' });
}
