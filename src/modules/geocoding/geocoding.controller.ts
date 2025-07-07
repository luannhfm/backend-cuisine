// modules/geocoding/controllers/geocoding.controller.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { GeocodingService } from './geocoding.service';

export class GeocodingController {
  private geocodingService: GeocodingService;

  constructor() {
    this.geocodingService = new GeocodingService();
  }

  // GET /api/geocoding/search?q=endereço
  async searchAddresses(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { q } = request.query as { q: string };

      if (!q || typeof q !== 'string') {
        return reply.status(400).send({
          success: false,
          error: 'Parâmetro "q" (query) é obrigatório'
        });
      }

      if (q.length < 3) {
        return reply.send({
          success: true,
          suggestions: []
        });
      }

      console.log(`Buscando endereços para: "${q}"`);

      const suggestions = await this.geocodingService.searchAddresses(q);

      return reply.send({
        success: true,
        suggestions,
        count: suggestions.length
      });

    } catch (error) {
      console.error('Erro no controller de geocoding:', error);
      
      return reply.status(500).send({
        success: false,
        error: 'Erro interno do servidor ao buscar endereços'
      });
    }
  }

  // POST /api/geocoding/validate
  async validateAddress(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { street, city, state, zipCode } = request.body as {
        street: string;
        city: string;
        state: string;
        zipCode: string;
      };

      // Validar campos obrigatórios
      if (!street || !city || !state || !zipCode) {
        return reply.status(400).send({
          success: false,
          error: 'Todos os campos são obrigatórios: street, city, state, zipCode'
        });
      }

      console.log('Validando endereço:', { street, city, state, zipCode });

      const isValid = await this.geocodingService.validateAddress({
        street,
        city,
        state,
        zipCode
      });

      return reply.send({
        success: true,
        valid: isValid
      });

    } catch (error) {
      console.error('Erro na validação de endereço:', error);
      
      return reply.status(500).send({
        success: false,
        error: 'Erro interno do servidor ao validar endereço'
      });
    }
  }

  // GET /api/geocoding/health - Verificar se a API está funcionando
  async healthCheck(request: FastifyRequest, reply: FastifyReply) {
    try {
      // Fazer uma busca simples para testar a API
      const testResult = await this.geocodingService.searchAddresses('New York');
      
      return reply.send({
        success: true,
        status: 'healthy',
        apiWorking: testResult.length > 0,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Erro no health check:', error);
      
      return reply.status(500).send({
        success: false,
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString()
      });
    }
  }
}

