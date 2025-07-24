import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiHeader, ApiBody } from '@nestjs/swagger';
import { UserService } from './user.service';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TenantSchemaInterceptor } from '@/common/interceptors/tenant-schema.interceptor';
import { TenantId, Roles } from '@/common/decorators/tenant.decorator';
import { RolesGuard } from '@/common/guards/tenant.guard';
import { User, UserRole, UserStatus } from '@/database/entities';

@ApiTags('Users')
@Controller('users')
@UseGuards(TenantGuard, JwtAuthGuard, RolesGuard)
@UseInterceptors(TenantSchemaInterceptor)
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles('owner', 'admin')
  @ApiOperation({ summary: 'Create a new user', description: 'Cria um novo usuário no tenant informado. É necessário informar o header x-tenant-id.' })
  @ApiHeader({ name: 'x-tenant-id', description: 'ID do tenant', required: true, example: 'tenant-123' })
  @ApiBody({
    schema: {
      example: {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'user',
      },
    },
  })
  @ApiResponse({ status: 201, description: 'User created successfully', schema: { example: { id: 'user-123', email: 'john@example.com', first_name: 'John', last_name: 'Doe', role: 'user', status: 'active', tenant_id: 'tenant-123' } } })
  @ApiResponse({ status: 400, description: 'Bad request', schema: { example: { statusCode: 400, message: 'Validation failed', error: 'Bad Request' } } })
  async createUser(
    @Body() userData: Partial<User>,
    @TenantId() tenantId: string,
  ): Promise<User> {
    return this.userService.createUser(userData, tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users for the current tenant', description: 'Retorna todos os usuários do tenant informado via x-tenant-id.' })
  @ApiHeader({ name: 'x-tenant-id', description: 'ID do tenant', required: true, example: 'tenant-123' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully', schema: { example: { users: [{ id: 'user-123', email: 'john@example.com', first_name: 'John', last_name: 'Doe', role: 'user', status: 'active', tenant_id: 'tenant-123' }], total: 1, page: 1, limit: 10, totalPages: 1 } } })
  async getUsers(
    @TenantId() tenantId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.userService.getUsersByTenant(tenantId, page, limit);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get user statistics for the current tenant', description: 'Retorna estatísticas de usuários do tenant informado via x-tenant-id.' })
  @ApiHeader({ name: 'x-tenant-id', description: 'ID do tenant', required: true, example: 'tenant-123' })
  @ApiResponse({ status: 200, description: 'User statistics retrieved successfully', schema: { example: { total: 10, active: 8, pending: 1, suspended: 1, byRole: [{ role: 'admin', count: 2 }, { role: 'user', count: 8 }] } } })
  async getUserStats(@TenantId() tenantId: string) {
    return this.userService.getUserStats(tenantId);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search users by name or email', description: 'Busca usuários por nome ou email no tenant informado via x-tenant-id.' })
  @ApiHeader({ name: 'x-tenant-id', description: 'ID do tenant', required: true, example: 'tenant-123' })
  @ApiResponse({ status: 200, description: 'Users found successfully', schema: { example: [{ id: 'user-123', email: 'john@example.com', first_name: 'John', last_name: 'Doe', role: 'user', status: 'active', tenant_id: 'tenant-123' }] } })
  async searchUsers(
    @TenantId() tenantId: string,
    @Query('q') query: string,
  ): Promise<User[]> {
    return this.userService.searchUsers(tenantId, query);
  }

  @Get('role/:role')
  @ApiOperation({ summary: 'Get users by role', description: 'Retorna usuários por role no tenant informado via x-tenant-id.' })
  @ApiHeader({ name: 'x-tenant-id', description: 'ID do tenant', required: true, example: 'tenant-123' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully', schema: { example: [{ id: 'user-123', email: 'john@example.com', first_name: 'John', last_name: 'Doe', role: 'admin', status: 'active', tenant_id: 'tenant-123' }] } })
  async getUsersByRole(
    @TenantId() tenantId: string,
    @Param('role') role: UserRole,
  ): Promise<User[]> {
    return this.userService.getUsersByRole(tenantId, role);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active users', description: 'Retorna usuários ativos do tenant informado via x-tenant-id.' })
  @ApiHeader({ name: 'x-tenant-id', description: 'ID do tenant', required: true, example: 'tenant-123' })
  @ApiResponse({ status: 200, description: 'Active users retrieved successfully', schema: { example: [{ id: 'user-123', email: 'john@example.com', first_name: 'John', last_name: 'Doe', role: 'user', status: 'active', tenant_id: 'tenant-123' }] } })
  async getActiveUsers(@TenantId() tenantId: string): Promise<User[]> {
    return this.userService.getActiveUsers(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID', description: 'Retorna um usuário pelo ID no tenant informado via x-tenant-id.' })
  @ApiHeader({ name: 'x-tenant-id', description: 'ID do tenant', required: true, example: 'tenant-123' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully', schema: { example: { id: 'user-123', email: 'john@example.com', first_name: 'John', last_name: 'Doe', role: 'user', status: 'active', tenant_id: 'tenant-123' } } })
  async getUser(
    @Param('id') userId: string,
    @TenantId() tenantId: string,
  ): Promise<User> {
    return this.userService.getUserById(userId, tenantId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user', description: 'Atualiza um usuário pelo ID no tenant informado via x-tenant-id.' })
  @ApiHeader({ name: 'x-tenant-id', description: 'ID do tenant', required: true, example: 'tenant-123' })
  @ApiBody({
    schema: {
      example: {
        first_name: 'Updated',
        last_name: 'Name',
        role: 'admin',
      },
    },
  })
  @ApiResponse({ status: 200, description: 'User updated successfully', schema: { example: { id: 'user-123', email: 'john@example.com', first_name: 'Updated', last_name: 'Name', role: 'admin', status: 'active', tenant_id: 'tenant-123' } } })
  async updateUser(
    @Param('id') userId: string,
    @Body() updateData: Partial<User>,
    @TenantId() tenantId: string,
  ): Promise<User> {
    return this.userService.updateUser(userId, tenantId, updateData);
  }

  @Put(':id/status')
  @Roles('owner', 'admin')
  @ApiOperation({ summary: 'Update user status', description: 'Atualiza o status de um usuário pelo ID no tenant informado via x-tenant-id.' })
  @ApiHeader({ name: 'x-tenant-id', description: 'ID do tenant', required: true, example: 'tenant-123' })
  @ApiBody({ schema: { example: { status: 'active' } } })
  @ApiResponse({ status: 200, description: 'User status updated successfully', schema: { example: { id: 'user-123', status: 'active' } } })
  async updateUserStatus(
    @Param('id') userId: string,
    @Body('status') status: UserStatus,
    @TenantId() tenantId: string,
  ): Promise<User> {
    return this.userService.updateUserStatus(userId, tenantId, status);
  }

  @Put(':id/role')
  @Roles('owner', 'admin')
  @ApiOperation({ summary: 'Update user role', description: 'Atualiza o role de um usuário pelo ID no tenant informado via x-tenant-id.' })
  @ApiHeader({ name: 'x-tenant-id', description: 'ID do tenant', required: true, example: 'tenant-123' })
  @ApiBody({ schema: { example: { role: 'admin' } } })
  @ApiResponse({ status: 200, description: 'User role updated successfully', schema: { example: { id: 'user-123', role: 'admin' } } })
  async updateUserRole(
    @Param('id') userId: string,
    @Body('role') role: UserRole,
    @TenantId() tenantId: string,
  ): Promise<User> {
    return this.userService.updateUserRole(userId, tenantId, role);
  }

  @Delete(':id')
  @Roles('owner', 'admin')
  @ApiOperation({ summary: 'Delete user', description: 'Deleta um usuário pelo ID no tenant informado via x-tenant-id.' })
  @ApiHeader({ name: 'x-tenant-id', description: 'ID do tenant', required: true, example: 'tenant-123' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  async deleteUser(
    @Param('id') userId: string,
    @TenantId() tenantId: string,
  ): Promise<void> {
    return this.userService.deleteUser(userId, tenantId);
  }
} 