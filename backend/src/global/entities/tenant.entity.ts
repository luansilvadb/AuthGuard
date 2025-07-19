import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('tenant')
export class Tenant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @ManyToOne(() => User, (user) => user.tenants)
  owner: User | null;

  // Hierarquia de tenants
  @ManyToOne(() => Tenant, (tenant) => tenant.subTenants, { nullable: true })
  @JoinColumn({ name: 'parentTenantId' })
  parentTenant: Tenant | null;

  @Column({ nullable: true })
  parentTenantId: number | null;

  @OneToMany(() => Tenant, (tenant) => tenant.parentTenant)
  subTenants: Tenant[];

  // Campos adicionais para controle
  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  // Nota: Branches são gerenciadas dentro do schema de cada matriz
  // Não há relação direta aqui, pois branches ficam isoladas por schema
}
