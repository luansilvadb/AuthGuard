import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../global/entities/user.entity';
import { Tenant } from '../global/entities/tenant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Tenant]),
    PassportModule,
    JwtModule.register({
      secret: 'secretKey', // Troque para variável de ambiente em produção
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
