import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("shipping_quotes")
export class ShippingQuote {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: true })
  customerId: string;

  @Column({ type: 'varchar' })
  carrier: string;

  @Column({ type: 'varchar' })
  service: string;

  @Column({ type: 'varchar' })
  serviceName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  cost: number;

  @Column({ type: 'varchar', default: 'USD' })
  currency: string;

  @Column({ type: 'varchar', nullable: true })
  transitTime: string;

  @Column({ type: 'varchar', nullable: true })
  deliveryDate: string;

  @Column({ type: 'varchar', nullable: true })
  estimatedDelivery: string;

  // Dados do remetente
  @Column({ type: 'varchar' })
  shipperName: string;

  @Column({ type: 'varchar' })
  shipperStreet: string;

  @Column({ type: 'varchar' })
  shipperCity: string;

  @Column({ type: 'varchar' })
  shipperState: string;

  @Column({ type: 'varchar' })
  shipperZipCode: string;

  @Column({ type: 'varchar', default: 'US' })
  shipperCountry: string;

  // Dados do destinatário
  @Column({ type: 'varchar' })
  recipientName: string;

  @Column({ type: 'varchar' })
  recipientStreet: string;

  @Column({ type: 'varchar' })
  recipientCity: string;

  @Column({ type: 'varchar' })
  recipientState: string;

  @Column({ type: 'varchar' })
  recipientZipCode: string;

  @Column({ type: 'varchar', default: 'US' })
  recipientCountry: string;

  // Dados dos pacotes (JSON)
  @Column({ type: 'jsonb' })
  packages: Array<{
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
    packagingType?: string;
    declaredValue?: number;
  }>;

  // Hash para cache (baseado nos dados de entrada)
  @Column({ type: 'varchar', unique: true })
  cacheKey: string;

  // Dados brutos da resposta da API (para debug)
  @Column({ type: 'jsonb', nullable: true })
  rawApiResponse: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Índice para expiração do cache (5 minutos)
  @Column({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP + INTERVAL '5 minutes'" })
  expiresAt: Date;
}

