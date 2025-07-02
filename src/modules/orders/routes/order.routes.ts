import { FastifyInstance } from 'fastify';
import { getCustomerOrdersController } from '../controllers/get-customer-orders.controller';
import { stripeWebhookController } from '../controllers/stripe-webhook.controller';
import { getOrderBySessionController } from '../controllers/get-order-by-session.controller';
import { getAllOrdersController } from '../controllers/get-orderAll-controller';

export async function orderRoutes(app: FastifyInstance) {
  app.get('/orders/session/:sessionId', getOrderBySessionController);
  app.get('/orders', getAllOrdersController);
  app.post('/orders/webhook', {
    config: {
      rawBody: true
    }
  }, stripeWebhookController);  app.get('/orders/customer/:customerId', getCustomerOrdersController);
}
