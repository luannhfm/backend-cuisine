import { FastifyRequest, FastifyReply } from 'fastify';
import { ShippingService } from '../services/shipping.service';
import { RateRequestSchema } from '../schemas/shipping.schema';

export async function getRatesController(request: FastifyRequest, reply: FastifyReply) {
  try {
    // Validar dados de entrada
    const validatedData = RateRequestSchema.parse(request.body);
    const { carrier, shipmentData } = validatedData;

    // Extrair customerId do header ou query se disponível
    const customerId = (request.headers['customer-id'] as string) || 
                      (request.query as any)?.customerId;

    const shippingService = new ShippingService();
    
    // Verificar se deve usar mock ou APIs reais
    const useMock = process.env.SHIPPING_USE_MOCK === 'true' || 
                   process.env.NODE_ENV === 'development';

    let rates;
    if (useMock) {
      rates = await shippingService.getMockRates(carrier, shipmentData);
    } else {
      rates = await shippingService.getRates(carrier, shipmentData, customerId);
    }

    return reply.send({
      success: true,
      rates,
      cached: false, // TODO: implementar detecção de cache
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Get Rates Error:', error);

    // Erro de validação
    if (error.name === 'ZodError') {
      return reply.status(400).send({
        success: false,
        error: 'Dados de entrada inválidos',
        details: error.errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }

    // Outros erros
    return reply.status(500).send({
      success: false,
      error: error.message || 'Erro interno do servidor',
      timestamp: new Date().toISOString()
    });
  }
}

