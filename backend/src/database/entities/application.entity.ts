import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Tenant } from './tenant.entity';
import { License } from './license.entity';

export enum ApplicationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
}

export enum ApplicationType {
  WEB = 'web',
  MOBILE = 'mobile',
  DESKTOP = 'desktop',
  API = 'api',
  MICROSERVICE = 'microservice',
}

@Entity('applications')
@Index(['name', 'tenant_id'], { unique: true })
export class Application {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ApplicationType,
    default: ApplicationType.WEB,
  })
  type: ApplicationType;

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.PENDING,
  })
  status: ApplicationStatus;

  @Column({ type: 'uuid' })
  tenant_id: string;

  @ManyToOne(() => Tenant, (tenant) => tenant.applications)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @OneToMany(() => License, (license) => license.application)
  licenses: License[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  client_id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  client_secret: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  redirect_uris: string;

  @Column({ type: 'jsonb', nullable: true })
  config: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  permissions: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date;
} 