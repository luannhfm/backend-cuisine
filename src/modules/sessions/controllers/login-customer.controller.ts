import { FastifyRequest, FastifyReply } from 'fastify';
import { AppDataSource } from '../../../config/database';
import { loginCustomerSchema } from '../schemas/customer.schema';
import { Customer } from '../entities/entities';
import bcrypt from 'bcrypt';

export async function loginCustomerController(request: FastifyRequest, reply: FastifyReply) {
  const { email, password } = loginCustomerSchema.parse(request.body);

  const customerRepo = AppDataSource.getRepository(Customer);
  const customer = await customerRepo.findOneBy({ email });

  if (!customer || !(await bcrypt.compare(password, customer.password))) {
    return reply.status(401).send({ message: 'Invalid credentials' });
  }

  const token = await reply.jwtSign({ sub: customer.id });

  return reply.send({
    token,
    customerId: customer.id
  });
  }
