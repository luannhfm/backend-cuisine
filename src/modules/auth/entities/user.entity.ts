import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('users_admin')
export class UserAdmin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true }) // ADICIONE type: 'varchar'
  username: string;

  @Column({ type: 'varchar' }) // ADICIONE type: 'varchar'
  password: string;

  @CreateDateColumn({ type: 'timestamp' }) // opcional, mas explícito
  createdAt: Date;
}
