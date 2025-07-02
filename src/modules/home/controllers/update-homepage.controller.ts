import { FastifyRequest, FastifyReply } from 'fastify';
import { HomepageService } from '../services/homepage.service';

export async function updateHomepageController(request: FastifyRequest, reply: FastifyReply) {
  const data = request.body as any;
  const updated = await HomepageService.updateConfig(data);
  return reply.send(updated);
}
