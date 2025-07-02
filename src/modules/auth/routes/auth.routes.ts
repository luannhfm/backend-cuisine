import { FastifyInstance } from 'fastify';
import { loginController } from '../controllers/login.controller';

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/login', loginController);
}
