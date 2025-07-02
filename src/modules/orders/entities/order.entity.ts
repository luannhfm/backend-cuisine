import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  customerId: string;

  @Column({ type: 'jsonb' })
  items: {
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }[];

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @Column({ type: 'varchar', default: 'pending' })
  status: string;

  @Column({ type: 'varchar', nullable: true }) // permite ser nulo até receber o ID
  stripeSessionId: string;

  @Column({ type: 'varchar', nullable: true }) // permite ser nulo até receber o ID
  stripePaymentIntentId: string;

  @CreateDateColumn()
  createdAt: Date;
}