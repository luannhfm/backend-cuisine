import axios, { AxiosInstance } from 'axios';
import { ShipmentData, ShippingRate } from '../schemas/shipping.schema';

export class UPSService {
  private client: AxiosInstance;
  private baseURL: string;
  private clientId: string;
  private clientSecret: string;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor() {
    this.baseURL = process.env.UPS_BASE_URL || 'https://wwwcie.ups.com/api';
    this.clientId = process.env.UPS_CLIENT_ID || '';
    this.clientSecret = process.env.UPS_CLIENT_SECRET || '';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  private async authenticate(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.accessToken;
    }

    try {
      const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      
      const response = await axios.post(`${this.baseURL}/security/v1/oauth/token`, 
        'grant_type=client_credentials',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${credentials}`
          }
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = new Date(Date.now() + (response.data.expires_in * 1000));
      
      return this.accessToken;
    } catch (error: any) {
      console.error('UPS Authentication Error:', error.response?.data || error.message);
      throw new Error(`UPS Authentication failed: ${error.message}`);
    }
  }

  async getRates(shipmentData: ShipmentData): Promise<ShippingRate[]> {
    const token = await this.authenticate();
    
    const requestData = {
      RateRequest: {
        Request: {
          RequestOption: "Rate",
          TransactionReference: {
            CustomerContext: "Rating and Service"
          }
        },
        Shipment: {
          Shipper: {
            Name: shipmentData.shipper.name,
            ShipperNumber: shipmentData.shipper.accountNumber || process.env.UPS_ACCOUNT_NUMBER,
            Address: {
              AddressLine: shipmentData.shipper.address.street,
              City: shipmentData.shipper.address.city,
              StateProvinceCode: shipmentData.shipper.address.state,
              PostalCode: shipmentData.shipper.address.zipCode,
              CountryCode: shipmentData.shipper.address.country
            }
          },
          ShipTo: {
            Name: shipmentData.recipient.name,
            Address: {
              AddressLine: shipmentData.recipient.address.street,
              City: shipmentData.recipient.address.city,
              StateProvinceCode: shipmentData.recipient.address.state,
              PostalCode: shipmentData.recipient.address.zipCode,
              CountryCode: shipmentData.recipient.address.country
            }
          },
          ShipFrom: {
            Name: shipmentData.shipper.name,
            Address: {
              AddressLine: shipmentData.shipper.address.street,
              City: shipmentData.shipper.address.city,
              StateProvinceCode: shipmentData.shipper.address.state,
              PostalCode: shipmentData.shipper.address.zipCode,
              CountryCode: shipmentData.shipper.address.country
            }
          },
          Package: shipmentData.packages.map(pkg => ({
            PackagingType: {
              Code: pkg.packagingType || "02",
              Description: "Package"
            },
            Dimensions: {
              UnitOfMeasurement: {
                Code: "IN",
                Description: "Inches"
              },
              Length: pkg.dimensions.length.toString(),
              Width: pkg.dimensions.width.toString(),
              Height: pkg.dimensions.height.toString()
            },
            PackageWeight: {
              UnitOfMeasurement: {
                Code: "LBS",
                Description: "Pounds"
              },
              Weight: pkg.weight.toString()
            }
          }))
        }
      }
    };

    try {
      const response = await this.client.post('/rating/v1/Rate', requestData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'transId': `rate-${Date.now()}`,
          'transactionSrc': 'ecommerce-app'
        }
      });

      return this.parseUPSResponse(response.data);
    } catch (error: any) {
      console.error('UPS Rate Request Error:', error.response?.data || error.message);
      
      // Se for erro de autenticação, limpar token e tentar novamente
      if (error.response?.status === 401) {
        this.accessToken = null;
        this.tokenExpiry = null;
        throw new Error('UPS authentication expired. Please try again.');
      }
      
      throw new Error(`UPS Rate request failed: ${error.message}`);
    }
  }

  private parseUPSResponse(data: any): ShippingRate[] {
    const rates: ShippingRate[] = [];
    
    if (data.RateResponse && data.RateResponse.RatedShipment) {
      const ratedShipments = Array.isArray(data.RateResponse.RatedShipment) 
        ? data.RateResponse.RatedShipment 
        : [data.RateResponse.RatedShipment];

      ratedShipments.forEach(shipment => {
        const serviceCode = shipment.Service.Code;
        const serviceName = this.getUPSServiceName(serviceCode);
        
        rates.push({
          id: `ups_${serviceCode}`,
          carrier: 'UPS',
          service: serviceCode,
          serviceName: serviceName,
          cost: parseFloat(shipment.TotalCharges.MonetaryValue),
          currency: shipment.TotalCharges.CurrencyCode,
          transitTime: shipment.GuaranteedDelivery ? 
            `${shipment.GuaranteedDelivery.BusinessDaysInTransit} dias úteis` : 'N/A',
          deliveryDate: shipment.GuaranteedDelivery ? 
            shipment.GuaranteedDelivery.DeliveryByTime : undefined,
          estimatedDelivery: this.calculateEstimatedDelivery(shipment.GuaranteedDelivery)
        });
      });
    }

    return rates;
  }

  private getUPSServiceName(code: string): string {
    const serviceNames: { [key: string]: string } = {
      '01': 'UPS Next Day Air',
      '02': 'UPS 2nd Day Air',
      '03': 'UPS Ground',
      '12': 'UPS 3 Day Select',
      '13': 'UPS Next Day Air Saver',
      '14': 'UPS Next Day Air Early',
      '59': 'UPS 2nd Day Air A.M.',
      '65': 'UPS Saver'
    };
    return serviceNames[code] || `UPS Service ${code}`;
  }

  private calculateEstimatedDelivery(guaranteedDelivery: any): string {
    if (!guaranteedDelivery || !guaranteedDelivery.BusinessDaysInTransit) {
      return 'N/A';
    }

    const businessDays = parseInt(guaranteedDelivery.BusinessDaysInTransit);
    const today = new Date();
    let deliveryDate = new Date(today);
    let addedDays = 0;

    while (addedDays < businessDays) {
      deliveryDate.setDate(deliveryDate.getDate() + 1);
      
      // Pular fins de semana (sábado = 6, domingo = 0)
      if (deliveryDate.getDay() !== 0 && deliveryDate.getDay() !== 6) {
        addedDays++;
      }
    }

    return deliveryDate.toLocaleDateString('pt-BR');
  }

  // Método para testar conectividade
  async testConnection(): Promise<boolean> {
    try {
      await this.authenticate();
      return true;
    } catch (error) {
      console.error('UPS Connection Test Failed:', error);
      return false;
    }
  }
}

