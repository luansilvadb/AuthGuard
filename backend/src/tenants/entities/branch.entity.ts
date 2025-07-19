import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { BranchData } from './branch-data.entity';
import { BranchPermission } from './branch-permission.entity';

@Entity('branch')
export class Branch {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 50, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  matrixTenantId: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  settings: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => BranchData, (data) => data.branch)
  data: BranchData[];

  @OneToMany(() => BranchPermission, (permission) => permission.branch)
  permissions: BranchPermission[];
}
