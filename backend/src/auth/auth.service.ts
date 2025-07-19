import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../global/entities/user.entity';
import { Tenant } from '../global/entities/tenant.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOneBy({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async login(
    email: string,
    password: string,
  ): Promise<{
    access_token: string;
    user: {
      id: number;
      email: string;
      name: string;
      tenants: Tenant[];
    };
  }> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['tenants'],
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload = { sub: user.id, email: user.email };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        tenants: user.tenants,
      },
    };
  }

  async getUserWithTenants(userId: number): Promise<{
    id: number;
    email: string;
    name: string;
    tenants: Tenant[];
  }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['tenants'],
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      tenants: user.tenants,
    };
  }
}
