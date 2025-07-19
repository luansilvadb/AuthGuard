import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  HttpStatus,
  Get,
  Param,
} from '@nestjs/common';
import { TenantService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

interface CustomRequest extends Request {
  user: {
    id: number;
    email: string;
  };
}

@ApiTags('3-tenants (criação)')
@ApiBearerAuth()
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantService: TenantService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Criar novo tenant',
    description:
      'Cria um novo tenant para o usuário autenticado. Se for o primeiro tenant, cria uma matriz. Se não, cria uma filial controlada pela tabela branch.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Tenant criado com sucesso',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        name: { type: 'string', example: 'TechStart Solutions' },
        slug: { type: 'string', example: 'tenant_techstart_solutions' },
        parentTenantId: { type: 'number', example: null, nullable: true },
        owner: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            email: { type: 'string', example: 'user@example.com' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos ou nome muito curto/longo',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Usuário já possui tenant com este nome',
  })
  async create(
    @Body() createTenantDto: CreateTenantDto,
    @Req() req: CustomRequest,
  ) {
    // O backend usa o id do usuário autenticado (req.user.id)
    return this.tenantService.createTenant(
      req.user.id, 
      createTenantDto.name, 
      createTenantDto.parentTenantId
    );
  }

  @Get()
  async findAll() {
    return this.tenantService.findAll();
  }

  @Get('my-tenants')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Listar tenants do usuário',
    description: 'Retorna todos os tenants (incluindo sub-tenants) do usuário autenticado',
  })
  async findUserTenants(@Req() req: CustomRequest) {
    return this.tenantService.findUserTenants(req.user.id);
  }

  @Get('my-matrix-and-branches')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Listar matriz e filiais do usuário',
    description: 'Retorna a matriz do usuário e todas as filiais controladas pela tabela branch',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Matriz e filiais retornadas com sucesso',
    schema: {
      type: 'object',
      properties: {
        matrix: {
          type: 'object',
          nullable: true,
          properties: {
            id: { type: 'number' },
            name: { type: 'string' },
            slug: { type: 'string' },
          },
        },
        branches: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              name: { type: 'string' },
              slug: { type: 'string' },
              description: { type: 'string' },
              isActive: { type: 'boolean' },
            },
          },
        },
      },
    },
  })
  async findUserMatrixAndBranches(@Req() req: CustomRequest) {
    return this.tenantService.findUserMatrixAndBranches(req.user.id);
  }

  @Get(':id/sub-tenants')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Listar sub-tenants',
    description: 'Retorna todos os sub-tenants de um tenant específico',
  })
  async findSubTenants(@Param('id') id: number) {
    return this.tenantService.findSubTenants(id);
  }

  @Get(':id/branches')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Listar filiais de uma matriz',
    description: 'Retorna todas as filiais controladas pela tabela branch de uma matriz específica',
  })
  async findBranchesByMatrix(@Param('id') matrixTenantId: number) {
    return this.tenantService.findBranchesByMatrix(matrixTenantId);
  }
}
