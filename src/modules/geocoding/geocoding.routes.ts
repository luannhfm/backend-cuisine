// modules/geocoding/routes/geocoding.routes.ts
import { FastifyInstance } from 'fastify';
import { GeocodingController } from './geocoding.controller';

export async function geocodingRoutes(fastify: FastifyInstance) {
  const geocodingController = new GeocodingController();

  // Buscar sugestões de endereços
  fastify.get('/geocoding/search', {
    schema: {
      description: 'Buscar sugestões de endereços usando Google Places API',
      tags: ['Geocoding'],
      querystring: {
        type: 'object',
        properties: {
          q: { 
            type: 'string', 
            description: 'Texto do endereço para buscar',
            minLength: 3
          }
        },
        required: ['q']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            suggestions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  street: { type: 'string' },
                  city: { type: 'string' },
                  state: { type: 'string' },
                  zipCode: { type: 'string' },
                  country: { type: 'string' },
                  formatted: { type: 'string' }
                }
              }
            },
            count: { type: 'number' }
          }
        },
        400: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' }
          }
        }
      }
    }
  }, geocodingController.searchAddresses.bind(geocodingController));

  // Validar endereço completo
  fastify.post('/geocoding/validate', {
    schema: {
      description: 'Validar se um endereço completo é válido',
      tags: ['Geocoding'],
      body: {
        type: 'object',
        properties: {
          street: { type: 'string' },
          city: { type: 'string' },
          state: { type: 'string' },
          zipCode: { type: 'string' }
        },
        required: ['street', 'city', 'state', 'zipCode']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            valid: { type: 'boolean' }
          }
        }
      }
    }
  }, geocodingController.validateAddress.bind(geocodingController));

  // Health check da API
  fastify.get('/geocoding/health', {
    schema: {
      description: 'Verificar se a API de geocoding está funcionando',
      tags: ['Geocoding'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            status: { type: 'string' },
            apiWorking: { type: 'boolean' },
            timestamp: { type: 'string' }
          }
        }
      }
    }
  }, geocodingController.healthCheck.bind(geocodingController));
}

