import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TenantService } from './tenant.service';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { TenantSchemaInterceptor } from '@/common/interceptors/tenant-schema.interceptor';
import { CurrentTenant, TenantId } from '@/common/decorators/tenant.decorator';
import { Tenant, TenantStatus } from '@/database/entities';

@ApiTags('Tenants')
@Controller('tenants')
@UseGuards(TenantGuard)
@UseInterceptors(TenantSchemaInterceptor)
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new tenant' })
  @ApiResponse({ status: 201, description: 'Tenant created successfully' })
  async createTenant(@Body() tenantData: Partial<Tenant>): Promise<Tenant> {
    return this.tenantService.createTenant(tenantData);
  }

  @Post(':parentId/sub-tenants')
  @ApiOperation({ summary: 'Create a sub-tenant under a parent tenant' })
  @ApiResponse({ status: 201, description: 'Sub-tenant created successfully' })
  async createSubTenant(
    @Param('parentId') parentId: string,
    @Body() subTenantData: Partial<Tenant>,
  ): Promise<Tenant> {
    return this.tenantService.createSubTenant(parentId, subTenantData);
  }

  @Get(':id/hierarchy')
  @ApiOperation({ summary: 'Get tenant hierarchy (parent and sub-tenants)' })
  @ApiResponse({ status: 200, description: 'Tenant hierarchy retrieved successfully' })
  async getTenantHierarchy(@Param('id') tenantId: string) {
    return this.tenantService.getTenantHierarchy(tenantId);
  }

  @Get(':parentId/sub-tenants')
  @ApiOperation({ summary: 'Get all sub-tenants of a parent tenant' })
  @ApiResponse({ status: 200, description: 'Sub-tenants retrieved successfully' })
  async getSubTenants(@Param('parentId') parentId: string): Promise<Tenant[]> {
    return this.tenantService.getTenantsByParent(parentId);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update tenant status' })
  @ApiResponse({ status: 200, description: 'Tenant status updated successfully' })
  async updateTenantStatus(
    @Param('id') tenantId: string,
    @Body('status') status: TenantStatus,
  ): Promise<Tenant> {
    return this.tenantService.updateTenantStatus(tenantId, status);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get tenant statistics' })
  @ApiResponse({ status: 200, description: 'Tenant statistics retrieved successfully' })
  async getTenantStats(@Param('id') tenantId: string) {
    return this.tenantService.getTenantStats(tenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a tenant' })
  @ApiResponse({ status: 200, description: 'Tenant deleted successfully' })
  async deleteTenant(@Param('id') tenantId: string): Promise<void> {
    return this.tenantService.deleteTenant(tenantId);
  }

  @Get('current')
  @ApiOperation({ summary: 'Get current tenant information' })
  @ApiResponse({ status: 200, description: 'Current tenant information retrieved' })
  async getCurrentTenant(@CurrentTenant() tenant: Tenant): Promise<Tenant> {
    return tenant;
  }
} 