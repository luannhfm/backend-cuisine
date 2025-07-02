import axios, { AxiosInstance } from 'axios';
import { env } from '../../../env';

interface FedExAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

interface FedExRateResponse {
  transactionId: string;
  output: {
    rateReplyDetails: Array<{
      serviceType: string;
      serviceName: string;
      ratedShipmentDetails: Array<{
        rateType: string;
        totalNetCharge: number;
        totalBaseCharge: number;
        currency: string;
        transitTime?: string;
      }>;
    }>;
  };
}

export class FedExService {
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: env.FEDEX_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log('FedEx Service initialized:', {
      baseURL: env.FEDEX_BASE_URL,
      hasApiKey: !!env.FEDEX_API_KEY,
      hasSecretKey: !!env.FEDEX_SECRET_KEY,
      apiKeyLength: env.FEDEX_API_KEY?.length,
      secretKeyLength: env.FEDEX_SECRET_KEY?.length
    });
  }

  private async authenticate(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }

    console.log('FedEx: Attempting authentication...');

    try {
      const response = await this.client.post<FedExAuthResponse>('/oauth/token', 
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: env.FEDEX_API_KEY!,
          client_secret: env.FEDEX_SECRET_KEY!
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = new Date(Date.now() + (response.data.expires_in * 1000) - 60000); // 1 min buffer

      console.log('FedEx: Authentication successful', {
        tokenType: response.data.token_type,
        expiresIn: response.data.expires_in,
        scope: response.data.scope
      });

      return this.accessToken;
    } catch (error: any) {
      console.error('FedEx Authentication Error:', error.response?.data || error.message);
      throw new Error(`FedEx Authentication failed: ${error.message}`);
    }
  }

  async getRates(shipmentData: any): Promise<any[]> {
    try {
      const token = await this.authenticate();

      console.log('=== FEDEX CORRECTED STRUCTURE (MULTIPLE SERVICES) ===');
      console.log('Removing fixed serviceType to get multiple service options');
      console.log('Input shipmentData:', JSON.stringify(shipmentData, null, 2));

      // Validar dados de entrada
      if (!shipmentData) {
        throw new Error('FedEx: shipmentData is required');
      }

      if (!shipmentData.recipient || !shipmentData.recipient.address) {
        throw new Error('FedEx: recipient address is required');
      }

      if (!shipmentData.shipper || !shipmentData.shipper.address) {
        throw new Error('FedEx: shipper address is required');
      }

      // Estrutura corrigida SEM serviceType fixo para obter múltiplos serviços
      const requestData = {
        accountNumber: {
          value: env.FEDEX_ACCOUNT_NUMBER || "740561073"
        },
        requestedShipment: {
          pickupType: "DROPOFF_AT_FEDEX_LOCATION",
          // ✅ REMOVIDO serviceType fixo para obter múltiplos serviços
          shipper: {
            contact: {
              personName: shipmentData.shipper?.name || "Test Shipper",
              phoneNumber: "1234567890"
            },
            address: {
              streetLines: [shipmentData.shipper?.address?.street || "123 Test St"],
              city: shipmentData.shipper?.address?.city || "Los Angeles",
              stateOrProvinceCode: shipmentData.shipper?.address?.state || "CA",
              postalCode: shipmentData.shipper?.address?.zipCode || "90210",
              countryCode: shipmentData.shipper?.address?.country || "US",
              residential: false
            }
          },
          recipient: {
            contact: {
              personName: shipmentData.recipient?.name || "Test Recipient",
              phoneNumber: "1234567890"
            },
            address: {
              streetLines: [shipmentData.recipient?.address?.street || "456 Test Ave"],
              city: shipmentData.recipient?.address?.city || "New York",
              stateOrProvinceCode: shipmentData.recipient?.address?.state || "NY",
              postalCode: shipmentData.recipient?.address?.zipCode || "10001",
              countryCode: shipmentData.recipient?.address?.country || "US",
              residential: true
            }
          },
          shipDateStamp: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          rateRequestType: ["LIST"], // ✅ Para obter múltiplos serviços
          requestedPackageLineItems: shipmentData.packages?.map((pkg: any, index: number) => ({
            sequenceNumber: index + 1,
            weight: {
              units: "LB",
              value: Math.max(1, pkg.weight || 1)
            },
            dimensions: {
              length: pkg.dimensions?.length || 12,
              width: pkg.dimensions?.width || 8,
              height: pkg.dimensions?.height || 6,
              units: "IN"
            }
          })) || [{
            sequenceNumber: 1,
            weight: {
              units: "LB",
              value: 1
            },
            dimensions: {
              length: 12,
              width: 8,
              height: 6,
              units: "IN"
            }
          }]
        }
      };

      console.log('=== CORRECTED REQUEST (MULTIPLE SERVICES) ===');
      console.log(JSON.stringify(requestData, null, 2));
      console.log('=== KEY CHANGES ===');
      console.log('✅ Removed fixed serviceType');
      console.log('✅ Using rateRequestType: ["LIST"] for multiple services');
      console.log('✅ Proper data validation');

      console.log('FedEx: Sending request for multiple services...');

      const response = await this.client.post<FedExRateResponse>('/rate/v1/rates/quotes', requestData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-locale': 'en_US'
        }
      });

      console.log('✅ FedEx: SUCCESS with multiple services!');
      console.log('Response:', JSON.stringify(response.data, null, 2));

      // Processar resposta para múltiplos serviços
      const rates = response.data.output?.rateReplyDetails?.map(detail => {
        const ratedDetail = detail.ratedShipmentDetails?.[0];
        return {
          id: `fedex_${detail.serviceType.toLowerCase()}`,
          carrier: 'FedEx',
          service: detail.serviceType,
          serviceName: detail.serviceName || detail.serviceType,
          cost: ratedDetail?.totalNetCharge || ratedDetail?.totalBaseCharge || 0,
          currency: ratedDetail?.currency || 'USD',
          transitTime: ratedDetail?.transitTime || 'N/A',
          estimatedDelivery: 'N/A'
        };
      }) || [];

      console.log(`✅ Processed ${rates.length} rate options:`, rates);
      return rates;

    } catch (error: any) {
      console.error('❌ FedEx Rate Request Error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });

      if (error.response?.data?.errors) {
        console.log('=== DETAILED ERROR ANALYSIS ===');
        error.response.data.errors.forEach((err: any, index: number) => {
          console.log(`Error ${index + 1}:`);
          console.log(`  Code: ${err.code}`);
          console.log(`  Message: ${err.message}`);
        });

        // Análise específica do erro
        const errorCodes = error.response.data.errors.map((err: any) => err.code);
        
        if (errorCodes.includes('SERVICE.PACKAGECOMBINATION.INVALID')) {
          console.log('=== PACKAGECOMBINATION ERROR ANALYSIS ===');
          console.log('💡 This error can mean:');
          console.log('   1. Package dimensions are invalid for the service');
          console.log('   2. Weight/dimension combination is not allowed');
          console.log('   3. Service not available for this route');
          console.log('🔧 CURRENT APPROACH: Using LIST mode for multiple services');
        }
      }

      throw new Error(`FedEx validation error: ${error.response?.data?.errors?.map((e: any) => `${e.code}: ${e.message}`).join(', ') || error.message}`);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.authenticate();
      return true;
    } catch (error) {
      console.error('FedEx connection test failed:', error);
      return false;
    }
  }
}

