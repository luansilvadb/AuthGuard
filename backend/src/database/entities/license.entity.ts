import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Subscription } from './subscription.entity';
import { Application } from './application.entity';

export enum LicenseStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
  PENDING = 'pending',
}

export enum LicenseType {
  TRIAL = 'trial',
  BASIC = 'basic',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise',
}

@Entity('licenses')
@Index(['license_key'], { unique: true })
export class License {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  license_key: string;

  @Column({ type: 'uuid' })
  subscription_id: string;

  @ManyToOne(() => Subscription, (subscription) => subscription.licenses)
  @JoinColumn({ name: 'subscription_id' })
  subscription: Subscription;

  @Column({ type: 'uuid', nullable: true })
  application_id: string;

  @ManyToOne(() => Application, { nullable: true })
  @JoinColumn({ name: 'application_id' })
  application: Application;

  @Column({
    type: 'enum',
    enum: LicenseType,
    default: LicenseType.BASIC,
  })
  type: LicenseType;

  @Column({
    type: 'enum',
    enum: LicenseStatus,
    default: LicenseStatus.PENDING,
  })
  status: LicenseStatus;

  @Column({ type: 'timestamp' })
  issued_date: Date;

  @Column({ type: 'timestamp' })
  expiry_date: Date;

  @Column({ type: 'integer', default: 0 })
  max_instances: number;

  @Column({ type: 'integer', default: 0 })
  current_instances: number;

  @Column({ type: 'jsonb', nullable: true })
  features: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  restrictions: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date;
} 