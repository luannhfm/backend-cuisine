// src/modules/checkout/checkout.routes.ts
import { FastifyInstance } from 'fastify';
import { createCheckoutController } from './checkout.controller';

export async function checkoutRoutes(app: FastifyInstance) {
  app.post('/checkout', createCheckoutController);
}
