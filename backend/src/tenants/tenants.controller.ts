import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { TenantService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
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
  async create(
    @Body() createTenantDto: CreateTenantDto,
    @Req() req: CustomRequest,
  ) {
    // O backend usa o id do usuário autenticado (req.user.id)
    return this.tenantService.createTenant(req.user.id, createTenantDto.name);
  }
}
