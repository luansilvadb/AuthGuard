import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TenantSchemaManagerService } from '../shared/database/tenant-schema-manager.service';

interface FixResult {
  slug: string;
  status: string;
  message: string;
}

@ApiTags('tenant-schemas (gerenciamento)')
@Controller('tenant-schemas')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class TenantSchemaController {
  constructor(
    private readonly tenantSchemaManagerService: TenantSchemaManagerService,
  ) {}

  @Get('status')
  @ApiOperation({ summary: 'Listar status de todos os schemas de tenant' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Status dos schemas retornado com sucesso',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          name: { type: 'string' },
          slug: { type: 'string' },
          schemaExists: { type: 'boolean' },
          hasDuplicates: { type: 'boolean' },
          hasSpecificTables: { type: 'boolean' },
          tableCount: { type: 'number' },
          tables: { type: 'array', items: { type: 'string' } },
          status: { type: 'string' },
          error: { type: 'string' },
        },
      },
    },
  })
  async getSchemasStatus(): Promise<any[]> {
    return this.tenantSchemaManagerService.getSchemasStatus();
  }

  @Post('fix/:tenantSlug')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Forçar correção de um schema específico' })
  @ApiParam({
    name: 'tenantSlug',
    description: 'Slug do tenant a ser corrigido',
    example: 'tenant_authguard',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Schema corrigido com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Tenant não encontrado',
  })
  async fixTenantSchema(@Param('tenantSlug') tenantSlug: string) {
    await this.tenantSchemaManagerService.fixTenantSchema(tenantSlug);
    return {
      message: `Schema do tenant ${tenantSlug} corrigido com sucesso`,
      tenantSlug,
    };
  }

  @Post('fix-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Forçar correção de todos os schemas' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Todos os schemas corrigidos com sucesso',
  })
  async fixAllSchemas() {
    const status = await this.tenantSchemaManagerService.getSchemasStatus();
    const tenantsToFix = status.filter(s => s.status !== 'OK');

    const results: FixResult[] = [];
    for (const tenant of tenantsToFix) {
      try {
        await this.tenantSchemaManagerService.fixTenantSchema(tenant.slug);
        results.push({
          slug: tenant.slug,
          status: 'FIXED',
          message: 'Corrigido com sucesso',
        });
      } catch (error) {
        results.push({
          slug: tenant.slug,
          status: 'ERROR',
          message: error.message,
        });
      }
    }

    return {
      message: `Processados ${tenantsToFix.length} schemas`,
      results,
    };
  }
} 