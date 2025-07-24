import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Subscription } from './subscription.entity';
import { Application } from './application.entity';

export enum TenantType {
  MATRIX = 'matrix',
  SUB_TENANT = 'sub_tenant',
}

export enum TenantStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
}

@Entity('tenants')
@Index(['schema_name'], { unique: true })
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  schema_name: string;

  @Column({ type: 'varchar', length: 255 })
  domain: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: TenantType,
    default: TenantType.MATRIX,
  })
  type: TenantType;

  @Column({
    type: 'enum',
    enum: TenantStatus,
    default: TenantStatus.PENDING,
  })
  status: TenantStatus;

  @Column({ type: 'uuid', nullable: true })
  parent_tenant_id: string;

  @ManyToOne(() => Tenant, { nullable: true })
  @JoinColumn({ name: 'parent_tenant_id' })
  parent_tenant: Tenant;

  @OneToMany(() => Tenant, (tenant) => tenant.parent_tenant)
  sub_tenants: Tenant[];

  @OneToMany(() => User, (user) => user.tenant)
  users: User[];

  @OneToMany(() => Subscription, (subscription) => subscription.tenant)
  subscriptions: Subscription[];

  @OneToMany(() => Application, (application) => application.tenant)
  applications: Application[];

  @Column({ type: 'jsonb', nullable: true })
  settings: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'uuid', nullable: true })
  owner_id: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date;
} 