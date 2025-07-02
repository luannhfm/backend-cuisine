import { FastifyRequest, FastifyReply } from 'fastify';
import { ShippingService } from '../services/shipping.service';
import { z } from 'zod';

const QuoteHistorySchema = z.object({
  customerId: z.string().min(1, "Customer ID é obrigatório"),
  limit: z.coerce.number().min(1).max(50).optional().default(10)
});

export async function getQuoteHistoryController(request: FastifyRequest, reply: FastifyReply) {
  try {
    // Validar parâmetros
    const { customerId } = request.params as { customerId: string };
    const { limit } = request.query as { limit?: number };

    const validatedData = QuoteHistorySchema.parse({ customerId, limit });

    const shippingService = new ShippingService();
    const history = await shippingService.getQuoteHistory(
      validatedData.customerId, 
      validatedData.limit
    );

    return reply.send({
      success: true,
      customerId: validatedData.customerId,
      history,
      count: history.length,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Get Quote History Error:', error);

    // Erro de validação
    if (error.name === 'ZodError') {
      return reply.status(400).send({
        success: false,
        error: 'Parâmetros inválidos',
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

