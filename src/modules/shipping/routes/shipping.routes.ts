import { FastifyInstance } from "fastify";
import { getRatesController } from "../controllers/get-rates.controller";
import { testConnectionsController } from "../controllers/test-connections.controller";
import { getQuoteHistoryController } from "../controllers/get-quote-history.controller";
import { clearCacheController } from "../controllers/clear-cache.controller";

export async function shippingRoutes(app: FastifyInstance) {
  // Rota principal para obter cotações de frete
  app.post("/shipping/rates", getRatesController);
  
  // Rota para testar conexões com as APIs
  app.get("/shipping/test", testConnectionsController);
  
  // Rota para obter histórico de cotações de um cliente
  app.get("/shipping/history/:customerId", getQuoteHistoryController);
  
  // Rota para limpar cache expirado (pode ser chamada por cron job)
  app.delete("/shipping/cache", clearCacheController);
  
  // Rota de health check específica para shipping
  app.get("/shipping/health", async (request, reply) => {
    return reply.send({
      status: "healthy",
      service: "shipping",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      mockMode: process.env.SHIPPING_USE_MOCK === 'true'
    });
  });
}

