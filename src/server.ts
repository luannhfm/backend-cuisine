import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import fastifyRawBody from 'fastify-raw-body';
import { productRoutes } from './modules/products/routes/product.routes';
import { authRoutes } from './modules/auth/routes/auth.routes';
import { sessionRoutes } from './modules/sessions/routes/session.routes';
import { orderRoutes } from './modules/orders/routes/order.routes';
import { homepageRoutes } from './modules/home/routes/homepage.routes';
import { checkoutRoutes } from './modules/checkout/checkout.routes';
import { shippingRoutes } from './modules/shipping/routes/shipping.routes';

export async function buildServer() {
  const app = Fastify({ logger: true , bodyLimit: 10 * 1024 * 1024 });

  // Libera requisições do frontend
  await app.register(cors, {
    origin: '*', //'http://localhost:4200',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false
  });

  await app.register(fastifyRawBody, {
    field: 'rawBody', // Nome do campo que conterá o corpo bruto
    global: false,    // Define se o corpo bruto estará disponível globalmente
    encoding: 'utf8', // Codificação do corpo bruto
    runFirst: true    // Garante que o corpo bruto seja capturado antes de qualquer outro processamento
  })

  // JWT setup
  await app.register(jwt, {
    secret: process.env.JWT_SECRET || 'SUUUUUUUPER-SECRET'
  });

  // Middleware de autenticação
  app.decorate('authenticate', async function (request: any, reply: any) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });

  // Rotas públicas
  await app.register(authRoutes); // /login
  await app.register(orderRoutes);
  await app.register(sessionRoutes);
  await app.register(productRoutes);
  await app.register(homepageRoutes);
  await app.register(checkoutRoutes, { prefix: '/api' });
  await app.register(shippingRoutes, { prefix: '/api' }); // Nova rota de shipping
  // Se quiser proteger:
  // await app.register(productRoutes, { prefix: '/products', onRequest: app.authenticate });

  return app;
   
}
