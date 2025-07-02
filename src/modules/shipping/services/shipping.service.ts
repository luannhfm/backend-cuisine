import { AppDataSource } from "../../../config/database";
import { ShippingQuote } from "../entities/shipping-quote.entity";
import { UPSService } from "./ups.service";
import { FedExService } from "./fedex.service";
import { ShipmentData, ShippingRate } from "../schemas/shipping.schema";
import crypto from 'crypto';

const shippingQuoteRepository = AppDataSource.getRepository(ShippingQuote);

export class ShippingService {
  private upsService: UPSService;
  private fedexService: FedExService;

  constructor() {
    this.upsService = new UPSService();
    this.fedexService = new FedExService();
  }

  async getRates(carrier: string, shipmentData: ShipmentData, customerId?: string): Promise<ShippingRate[]> {
    // Gerar chave de cache baseada nos dados de entrada
    const cacheKey = this.generateCacheKey(carrier, shipmentData);
    
    // Verificar cache primeiro
    const cachedRates = await this.getCachedRates(cacheKey);
    if (cachedRates && cachedRates.length > 0) {
      console.log('Returning cached shipping rates');
      return cachedRates;
    }

    const rates: ShippingRate[] = [];
    const errors: string[] = [];

    // Buscar cotações da UPS
    if (carrier === 'ups' || carrier === 'all') {
      try {
        const upsRates = await this.upsService.getRates(shipmentData);
        rates.push(...upsRates);
      } catch (error: any) {
        console.error('UPS Error:', error.message);
        errors.push(`UPS: ${error.message}`);
      }
    }

    // Buscar cotações da FedEx
    if (carrier === 'fedex' || carrier === 'all') {
      try {
        const fedexRates = await this.fedexService.getRates(shipmentData);
        rates.push(...fedexRates);
      } catch (error: any) {
        console.error('FedEx Error:', error.message);
        errors.push(`FedEx: ${error.message}`);
      }
    }

    // Se não conseguiu nenhuma cotação, retornar erro
    if (rates.length === 0) {
      throw new Error(`Não foi possível obter cotações: ${errors.join(', ')}`);
    }

    // Ordenar por preço
    rates.sort((a, b) => a.cost - b.cost);

    // Salvar no cache
    await this.cacheRates(cacheKey, rates, shipmentData, customerId);

    return rates;
  }

  private generateCacheKey(carrier: string, shipmentData: ShipmentData): string {
    const data = {
      carrier,
      shipperZip: shipmentData.shipper.address.zipCode,
      recipientZip: shipmentData.recipient.address.zipCode,
      packages: shipmentData.packages.map(pkg => ({
        weight: pkg.weight,
        dimensions: pkg.dimensions
      }))
    };
    
    const hash = crypto.createHash('md5');
    hash.update(JSON.stringify(data));
    return hash.digest('hex');
  }

  private async getCachedRates(cacheKey: string): Promise<ShippingRate[] | null> {
    try {
      const cachedQuotes = await shippingQuoteRepository
        .createQueryBuilder('quote')
        .where('quote.cacheKey = :cacheKey', { cacheKey })
        .andWhere('quote.expiresAt > :now', { now: new Date() })
        .getMany();

      if (cachedQuotes.length === 0) {
        return null;
      }

      return cachedQuotes.map(quote => ({
        id: `${quote.carrier.toLowerCase()}_${quote.service}`,
        carrier: quote.carrier,
        service: quote.service,
        serviceName: quote.serviceName,
        cost: Number(quote.cost),
        currency: quote.currency,
        transitTime: quote.transitTime || 'N/A',
        deliveryDate: quote.deliveryDate,
        estimatedDelivery: quote.estimatedDelivery
      }));
    } catch (error) {
      console.error('Error getting cached rates:', error);
      return null;
    }
  }

  private async cacheRates(
    cacheKey: string, 
    rates: ShippingRate[], 
    shipmentData: ShipmentData, 
    customerId?: string
  ): Promise<void> {
    try {
      // Limpar cache antigo para esta chave
      await shippingQuoteRepository.delete({ cacheKey });

      // Salvar novas cotações
      const quotesToSave = rates.map(rate => {
        const quote = new ShippingQuote();
        quote.customerId = customerId || null;
        quote.carrier = rate.carrier;
        quote.service = rate.service;
        quote.serviceName = rate.serviceName;
        quote.cost = rate.cost;
        quote.currency = rate.currency;
        quote.transitTime = rate.transitTime;
        quote.deliveryDate = rate.deliveryDate;
        quote.estimatedDelivery = rate.estimatedDelivery;
        
        // Dados do remetente
        quote.shipperName = shipmentData.shipper.name;
        quote.shipperStreet = shipmentData.shipper.address.street;
        quote.shipperCity = shipmentData.shipper.address.city;
        quote.shipperState = shipmentData.shipper.address.state;
        quote.shipperZipCode = shipmentData.shipper.address.zipCode;
        quote.shipperCountry = shipmentData.shipper.address.country;
        
        // Dados do destinatário
        quote.recipientName = shipmentData.recipient.name;
        quote.recipientStreet = shipmentData.recipient.address.street;
        quote.recipientCity = shipmentData.recipient.address.city;
        quote.recipientState = shipmentData.recipient.address.state;
        quote.recipientZipCode = shipmentData.recipient.address.zipCode;
        quote.recipientCountry = shipmentData.recipient.address.country;
        
        // Dados dos pacotes
        quote.packages = shipmentData.packages;
        quote.cacheKey = cacheKey;
        
        return quote;
      });

      await shippingQuoteRepository.save(quotesToSave);
    } catch (error) {
      console.error('Error caching rates:', error);
      // Não falhar se não conseguir cachear
    }
  }

  async getQuoteHistory(customerId: string, limit: number = 10): Promise<ShippingQuote[]> {
    return await shippingQuoteRepository
      .createQueryBuilder('quote')
      .where('quote.customerId = :customerId', { customerId })
      .orderBy('quote.createdAt', 'DESC')
      .limit(limit)
      .getMany();
  }

  async clearExpiredCache(): Promise<void> {
    try {
      await shippingQuoteRepository
        .createQueryBuilder()
        .delete()
        .where('expiresAt < :now', { now: new Date() })
        .execute();
      
      console.log('Expired shipping cache cleared');
    } catch (error) {
      console.error('Error clearing expired cache:', error);
    }
  }

  async testConnections(): Promise<{ ups: boolean; fedex: boolean }> {
    const [upsStatus, fedexStatus] = await Promise.allSettled([
      this.upsService.testConnection(),
      this.fedexService.testConnection()
    ]);

    return {
      ups: upsStatus.status === 'fulfilled' ? upsStatus.value : false,
      fedex: fedexStatus.status === 'fulfilled' ? fedexStatus.value : false
    };
  }

  // Método para simular cotações (para desenvolvimento/teste)
  async getMockRates(carrier: string, shipmentData: ShipmentData): Promise<ShippingRate[]> {
    const basePrice = 10 + (shipmentData.packages.reduce((sum, pkg) => sum + pkg.weight, 0) * 0.5);
    const distance = this.calculateMockDistance(
      shipmentData.shipper.address.zipCode,
      shipmentData.recipient.address.zipCode
    );
    
    const rates: ShippingRate[] = [];

    if (carrier === 'ups' || carrier === 'all') {
      rates.push(
        {
          id: 'ups_ground',
          carrier: 'UPS',
          service: '03',
          serviceName: 'UPS Ground',
          cost: Math.round((basePrice + distance * 0.1) * 100) / 100,
          currency: 'USD',
          transitTime: '3-5 dias úteis',
          estimatedDelivery: this.addBusinessDays(new Date(), 4).toLocaleDateString('pt-BR')
        },
        {
          id: 'ups_3day',
          carrier: 'UPS',
          service: '12',
          serviceName: 'UPS 3 Day Select',
          cost: Math.round((basePrice + distance * 0.2) * 100) / 100,
          currency: 'USD',
          transitTime: '3 dias úteis',
          estimatedDelivery: this.addBusinessDays(new Date(), 3).toLocaleDateString('pt-BR')
        },
        {
          id: 'ups_2day',
          carrier: 'UPS',
          service: '02',
          serviceName: 'UPS 2nd Day Air',
          cost: Math.round((basePrice + distance * 0.3) * 100) / 100,
          currency: 'USD',
          transitTime: '2 dias úteis',
          estimatedDelivery: this.addBusinessDays(new Date(), 2).toLocaleDateString('pt-BR')
        }
      );
    }

    if (carrier === 'fedex' || carrier === 'all') {
      rates.push(
        {
          id: 'fedex_ground',
          carrier: 'FedEx',
          service: 'FEDEX_GROUND',
          serviceName: 'FedEx Ground',
          cost: Math.round((basePrice + distance * 0.09) * 100) / 100,
          currency: 'USD',
          transitTime: '3-5 dias úteis',
          estimatedDelivery: this.addBusinessDays(new Date(), 4).toLocaleDateString('pt-BR')
        },
        {
          id: 'fedex_express',
          carrier: 'FedEx',
          service: 'FEDEX_EXPRESS_SAVER',
          serviceName: 'FedEx Express Saver',
          cost: Math.round((basePrice + distance * 0.25) * 100) / 100,
          currency: 'USD',
          transitTime: '3 dias úteis',
          estimatedDelivery: this.addBusinessDays(new Date(), 3).toLocaleDateString('pt-BR')
        },
        {
          id: 'fedex_2day',
          carrier: 'FedEx',
          service: 'FEDEX_2_DAY',
          serviceName: 'FedEx 2Day',
          cost: Math.round((basePrice + distance * 0.35) * 100) / 100,
          currency: 'USD',
          transitTime: '2 dias úteis',
          estimatedDelivery: this.addBusinessDays(new Date(), 2).toLocaleDateString('pt-BR')
        }
      );
    }

    return rates.sort((a, b) => a.cost - b.cost);
  }

  private calculateMockDistance(zip1: string, zip2: string): number {
    // Simulação simples baseada na diferença dos códigos postais
    const num1 = parseInt(zip1.replace(/\D/g, ''));
    const num2 = parseInt(zip2.replace(/\D/g, ''));
    return Math.abs(num1 - num2) / 1000;
  }

  private addBusinessDays(date: Date, days: number): Date {
    const result = new Date(date);
    let addedDays = 0;

    while (addedDays < days) {
      result.setDate(result.getDate() + 1);
      
      // Pular fins de semana
      if (result.getDay() !== 0 && result.getDay() !== 6) {
        addedDays++;
      }
    }

    return result;
  }
}

