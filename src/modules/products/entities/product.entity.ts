import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("products")
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal' })
  price: number;

  // @Column({ type: 'decimal', nullable: true })
  // promotionPrice: number;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'varchar' })
  category: string;

  @Column({ type: 'text', array: true, default: [] })
  images: string[];

  @Column({ type: 'varchar', nullable: true })
  stripeProductId: string;

  @Column({ type: 'varchar', nullable: true })
  stripePriceId: string;

  // ✅ NOVOS CAMPOS PARA FRETE
  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true, comment: 'Peso em libras (lbs)' })
  weight: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true, comment: 'Comprimento em polegadas (in)' })
  length: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true, comment: 'Largura em polegadas (in)' })
  width: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true, comment: 'Altura em polegadas (in)' })
  height: number;
}

