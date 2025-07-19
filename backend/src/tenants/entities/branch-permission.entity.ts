import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Branch } from './branch.entity';

@Entity('branch_permission')
export class BranchPermission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  branchId: number;

  @ManyToOne(() => Branch, (branch) => branch.permissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'branchId' })
  branch: Branch;

  @Column()
  userId: number; // Referência ao ID do usuário no schema 'public'

  @Column({ length: 50 })
  permission: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
