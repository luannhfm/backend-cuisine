import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('homepage_config')
export class HomepageConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true }) banner1: string;
  @Column({ type: 'text', nullable: true }) banner2: string;
  @Column({ type: 'text', nullable: true }) banner3: string;
  @Column({ type: 'text', nullable: true }) banner4: string;
  @Column({ type: 'text', nullable: true }) banner5: string;

  @Column({ type: 'text', nullable: true }) card1: string;
  @Column({ type: 'text', nullable: true }) card2: string;
  @Column({ type: 'text', nullable: true }) card3: string;
  @Column({ type: 'text', nullable: true }) card4: string;
}
