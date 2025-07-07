// modules/geocoding/services/geocoding.service.ts
import axios from 'axios';

export interface AddressSuggestion {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  formatted: string;
  placeId?: string;
}

export interface GooglePlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export interface GooglePlaceDetails {
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
  formatted_address: string;
}

export class GeocodingService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://maps.googleapis.com/maps/api';

  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('GOOGLE_MAPS_API_KEY não configurada no .env');
    }
  }

  // Buscar sugestões de endereços usando Place Autocomplete
  async searchAddresses(query: string): Promise<AddressSuggestion[]> {
    try {
      if (!query || query.length < 3) {
        return [];
      }

      console.log(`Buscando endereços para: ${query}`);

      // Primeira chamada: Place Autocomplete
      const autocompleteUrl = `${this.baseUrl}/place/autocomplete/json`;
      const autocompleteParams = {
        input: query,
        types: 'address',
        components: 'country:us',
        key: this.apiKey
      };

      const autocompleteResponse = await axios.get(autocompleteUrl, {
        params: autocompleteParams
      });

      if (autocompleteResponse.data.status !== 'OK') {
        console.error('Erro no autocomplete:', autocompleteResponse.data);
        return [];
      }

      const predictions: GooglePlacePrediction[] = autocompleteResponse.data.predictions || [];
      
      // Para cada predição, buscar detalhes completos
      const suggestions: AddressSuggestion[] = [];
      
      for (const prediction of predictions.slice(0, 5)) { // Limitar a 5 resultados
        try {
          const details = await this.getPlaceDetails(prediction.place_id);
          if (details) {
            const suggestion = this.parseGooglePlaceDetails(details, prediction.description);
            suggestions.push(suggestion);
          }
        } catch (error) {
          console.error(`Erro ao buscar detalhes para ${prediction.place_id}:`, error);
          // Continuar com os outros resultados
        }
      }

      console.log(`Encontradas ${suggestions.length} sugestões`);
      return suggestions;

    } catch (error) {
      console.error('Erro na busca de endereços:', error);
      throw new Error('Erro interno na busca de endereços');
    }
  }

  // Buscar detalhes completos de um lugar usando Place Details
  private async getPlaceDetails(placeId: string): Promise<GooglePlaceDetails | null> {
    try {
      const detailsUrl = `${this.baseUrl}/place/details/json`;
      const detailsParams = {
        place_id: placeId,
        fields: 'address_components,formatted_address',
        key: this.apiKey
      };

      const response = await axios.get(detailsUrl, {
        params: detailsParams
      });

      if (response.data.status === 'OK') {
        return response.data.result;
      }

      console.error(`Erro ao buscar detalhes do lugar ${placeId}:`, response.data);
      return null;

    } catch (error) {
      console.error(`Erro na requisição de detalhes para ${placeId}:`, error);
      return null;
    }
  }

  // Converter dados do Google Places para nossa interface
  private parseGooglePlaceDetails(placeDetails: GooglePlaceDetails, formattedAddress: string): AddressSuggestion {
    const components = placeDetails.address_components || [];
    
    // Extrair componentes do endereço
    const streetNumber = this.getAddressComponent(components, 'street_number');
    const route = this.getAddressComponent(components, 'route');
    const city = this.getAddressComponent(components, 'locality') || 
                 this.getAddressComponent(components, 'sublocality') ||
                 this.getAddressComponent(components, 'administrative_area_level_3');
    const state = this.getAddressComponent(components, 'administrative_area_level_1');
    const zipCode = this.getAddressComponent(components, 'postal_code');
    const country = this.getAddressComponent(components, 'country');
    
    // Montar endereço completo
    const street = `${streetNumber} ${route}`.trim();
    
    console.log('Dados extraídos do Google Places:', {
      street,
      city,
      state,
      zipCode,
      country
    });
    
    return {
      street,
      city,
      state,
      zipCode,
      country,
      formatted: placeDetails.formatted_address || formattedAddress
    };
  }

  // Método auxiliar para extrair componentes do endereço do Google
  private getAddressComponent(components: any[], type: string): string {
    const component = components.find(comp => comp.types.includes(type));
    return component ? component.short_name || component.long_name : '';
  }

  // Validar endereço completo (opcional)
  async validateAddress(address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  }): Promise<boolean> {
    try {
      const fullAddress = `${address.street}, ${address.city}, ${address.state} ${address.zipCode}, USA`;
      
      const geocodeUrl = `${this.baseUrl}/geocode/json`;
      const params = {
        address: fullAddress,
        key: this.apiKey
      };

      const response = await axios.get(geocodeUrl, { params });
      
      return response.data.status === 'OK' && response.data.results.length > 0;
    } catch (error) {
      console.error('Erro na validação de endereço:', error);
      return false;
    }
  }
}

