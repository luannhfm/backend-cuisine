import { FastifyRequest, FastifyReply } from 'fastify';
import { ShippingService } from '../services/shipping.service';

export async function clearCacheController(request: FastifyRequest, reply: FastifyReply) {
  try {
    const shippingService = new ShippingService();
    await shippingService.clearExpiredCache();

    return reply.send({
      success: true,
      message: 'Cache expirado limpo com sucesso',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Clear Cache Error:', error);
    
    return reply.status(500).send({
      success: false,
      error: error.message || 'Erro ao limpar cache',
      timestamp: new Date().toISOString()
    });
  }
}

