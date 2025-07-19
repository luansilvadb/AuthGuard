import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Branch } from './branch.entity';

@Entity('branch_data')
export class BranchData {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  branchId: number;

  @ManyToOne(() => Branch, (branch) => branch.data, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branchId' })
  branch: Branch;

  @Column({ length: 50 })
  entityType: string;

  @Column()
  entityId: number;

  @Column({ type: 'jsonb' })
  data: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
