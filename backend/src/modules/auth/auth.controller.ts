import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { LocalAuthGuard } from '@/common/guards/local-auth.guard';
import { LoginDto, RegisterDto, ChangePasswordDto, RefreshTokenDto } from '@/common/dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
      loginDto.tenant_id,
    );
    return this.authService.login(user);
  }

  @Post('register')
  @ApiOperation({
    summary: 'User registration (public)',
    description: 'Endpoint público para auto-registro de usuário e onboarding de tenant. Use este endpoint para criar o primeiro usuário (owner/admin) de um novo tenant. O fluxo padrão SaaS é: 1) O usuário se registra, 2) O sistema cria o tenant e o usuário inicial, 3) (Opcional) Envia e-mail de ativação.'
  })
  @ApiBody({
    schema: {
      example: {
        first_name: 'Alice',
        last_name: 'Silva',
        email: 'alice@empresa.com',
        password: 'senhaForte123',
        role: 'owner'
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Usuário registrado com sucesso',
    schema: { example: { id: 'user-123', email: 'alice@empresa.com', first_name: 'Alice', last_name: 'Silva', role: 'owner', status: 'pending', tenant_id: 'empresa-xyz' } }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
    schema: { example: { statusCode: 400, message: 'User with this email already exists', error: 'Bad Request' } }
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh JWT token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async refreshToken(@Request() req, @Body() refreshDto: RefreshTokenDto) {
    return this.authService.refreshToken(req.user.sub);
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
    return this.authService.changePassword(
      req.user.sub,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    );
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Request() req) {
    return req.user;
  }
} 