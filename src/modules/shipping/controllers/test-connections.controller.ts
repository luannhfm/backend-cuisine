import { FastifyRequest, FastifyReply } from 'fastify';
import { ShippingService } from '../services/shipping.service';

export async function testConnectionsController(request: FastifyRequest, reply: FastifyReply) {
  try {
    const shippingService = new ShippingService();
    const connections = await shippingService.testConnections();

    const allConnected = connections.ups && connections.fedex;
    const statusCode = allConnected ? 200 : 503;

    return reply.status(statusCode).send({
      success: allConnected,
      connections,
      message: allConnected 
        ? 'Todas as conexões estão funcionando' 
        : 'Algumas conexões falharam',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Test Connections Error:', error);
    
    return reply.status(500).send({
      success: false,
      error: error.message || 'Erro ao testar conexões',
      timestamp: new Date().toISOString()
    });
  }
}

