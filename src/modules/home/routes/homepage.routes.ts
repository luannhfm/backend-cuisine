import { FastifyInstance } from 'fastify';
import { getHomepageController } from '../controllers/get-homepage.controller';
import { updateHomepageController } from '../controllers/update-homepage.controller';

export async function homepageRoutes(app: FastifyInstance) {
  app.get('/ ', getHomepageController);
  app.put('/homepage-config', updateHomepageController);
}
