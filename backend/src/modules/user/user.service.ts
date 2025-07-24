import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole, UserStatus } from '@/database/entities';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async createUser(userData: Partial<User>, tenantId: string): Promise<User> {
    // Check if user already exists in the tenant
    const existingUser = await this.userRepository.findOne({
      where: { email: userData.email, tenant_id: tenantId },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists in this tenant');
    }

    // Hash password if provided
    if (userData.password) {
      userData.password = await bcrypt.hash(
        userData.password,
        this.configService.get('app.bcryptRounds', 12),
      );
    }

    const user = this.userRepository.create({
      ...userData,
      tenant_id: tenantId,
    });

    return this.userRepository.save(user);
  }

  async getUsersByTenant(tenantId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    const [users, total] = await this.userRepository.findAndCount({
      where: { tenant_id: tenantId },
      skip,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUserById(userId: string, tenantId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId, tenant_id: tenantId },
      relations: ['tenant'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUser(userId: string, tenantId: string, updateData: Partial<User>): Promise<User> {
    const user = await this.getUserById(userId, tenantId);

    // Don't allow updating email if it already exists
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateData.email, tenant_id: tenantId },
      });

      if (existingUser) {
        throw new ConflictException('Email already exists in this tenant');
      }
    }

    // Hash password if provided
    if (updateData.password) {
      updateData.password = await bcrypt.hash(
        updateData.password,
        this.configService.get('app.bcryptRounds', 12),
      );
    }

    Object.assign(user, updateData);
    return this.userRepository.save(user);
  }

  async updateUserStatus(userId: string, tenantId: string, status: UserStatus): Promise<User> {
    const user = await this.getUserById(userId, tenantId);
    user.status = status;
    return this.userRepository.save(user);
  }

  async updateUserRole(userId: string, tenantId: string, role: UserRole): Promise<User> {
    const user = await this.getUserById(userId, tenantId);
    user.role = role;
    return this.userRepository.save(user);
  }

  async deleteUser(userId: string, tenantId: string): Promise<void> {
    const user = await this.getUserById(userId, tenantId);
    
    // Soft delete
    user.deleted_at = new Date();
    await this.userRepository.save(user);
  }

  async getUsersByRole(tenantId: string, role: UserRole): Promise<User[]> {
    return this.userRepository.find({
      where: { tenant_id: tenantId, role, deleted_at: null },
    });
  }

  async getActiveUsers(tenantId: string): Promise<User[]> {
    return this.userRepository.find({
      where: { tenant_id: tenantId, status: UserStatus.ACTIVE, deleted_at: null },
    });
  }

  async getUserStats(tenantId: string) {
    const totalUsers = await this.userRepository.count({
      where: { tenant_id: tenantId, deleted_at: null },
    });

    const activeUsers = await this.userRepository.count({
      where: { tenant_id: tenantId, status: UserStatus.ACTIVE, deleted_at: null },
    });

    const pendingUsers = await this.userRepository.count({
      where: { tenant_id: tenantId, status: UserStatus.PENDING, deleted_at: null },
    });

    const suspendedUsers = await this.userRepository.count({
      where: { tenant_id: tenantId, status: UserStatus.SUSPENDED, deleted_at: null },
    });

    const usersByRole = await this.userRepository
      .createQueryBuilder('user')
      .select('user.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .where('user.tenant_id = :tenantId', { tenantId })
      .andWhere('user.deleted_at IS NULL')
      .groupBy('user.role')
      .getRawMany();

    return {
      total: totalUsers,
      active: activeUsers,
      pending: pendingUsers,
      suspended: suspendedUsers,
      byRole: usersByRole,
    };
  }

  async searchUsers(tenantId: string, query: string): Promise<User[]> {
    return this.userRepository
      .createQueryBuilder('user')
      .where('user.tenant_id = :tenantId', { tenantId })
      .andWhere('user.deleted_at IS NULL')
      .andWhere(
        '(user.first_name ILIKE :query OR user.last_name ILIKE :query OR user.email ILIKE :query)',
        { query: `%${query}%` }
      )
      .getMany();
  }
} 