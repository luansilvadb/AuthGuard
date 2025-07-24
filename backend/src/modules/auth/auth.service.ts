import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserStatus } from '@/database/entities';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from '@/common/dto/register.dto';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  tenantId: string;
  tenantSchema: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string, tenantId?: string): Promise<User> {
    const whereCondition: any = { email };
    if (tenantId) {
      whereCondition.tenant_id = tenantId;
    }

    const user = await this.userRepository.findOne({
      where: whereCondition,
      relations: ['tenant'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('User account is not active');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async login(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenant_id,
      tenantSchema: user.tenant.schema_name,
    };

    const token = this.jwtService.sign(payload);

    // Update last login
    user.last_login = new Date();
    await this.userRepository.save(user);

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        tenant_id: user.tenant_id,
        tenant: {
          id: user.tenant.id,
          name: user.tenant.name,
          schema_name: user.tenant.schema_name,
        },
      },
    };
  }

  async register(userData: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      userData.password,
      this.configService.get('app.bcryptRounds', 12),
    );

    // Create user
    const user = this.userRepository.create({
      first_name: userData.first_name,
      last_name: userData.last_name,
      email: userData.email,
      password: hashedPassword,
      tenant_id: userData.tenant_id ?? null, // aceita null
      role: (userData.role as any) || 'user',
      status: UserStatus.PENDING,
    });

    const savedUser = await this.userRepository.save(user);

    return {
      id: savedUser.id,
      email: savedUser.email,
      first_name: savedUser.first_name,
      last_name: savedUser.last_name,
      role: savedUser.role,
      status: savedUser.status,
    };
  }

  async refreshToken(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['tenant'],
    });

    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Invalid user');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenant_id,
      tenantSchema: user.tenant.schema_name,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(
      newPassword,
      this.configService.get('app.bcryptRounds', 12),
    );

    user.password = hashedNewPassword;
    await this.userRepository.save(user);

    return { message: 'Password changed successfully' };
  }
} 