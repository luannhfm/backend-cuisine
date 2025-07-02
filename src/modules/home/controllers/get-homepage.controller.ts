import { FastifyRequest, FastifyReply } from 'fastify';
import { HomepageService } from '../services/homepage.service';

export async function getHomepageController(request: FastifyRequest, reply: FastifyReply) {
  const config = await HomepageService.getConfig();
  return reply.send(config);
}
