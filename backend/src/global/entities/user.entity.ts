import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Tenant } from './tenant.entity';

@Entity({ schema: 'global' })
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column()
    name: string;

    @OneToMany(() => Tenant, tenant => tenant.owner)
    tenants: Tenant[];
}