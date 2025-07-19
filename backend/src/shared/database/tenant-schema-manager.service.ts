import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { cleanupTenantSchema, listTenantTables } from './cleanup-tenant-schema';
import { TenantMigrationService } from './tenant-migration.service';

interface TenantInfo {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
}

interface TenantSchemaStatus {
  id: number;
  name: string;
  slug: string;
  schemaExists?: boolean;
  hasDuplicates?: boolean;
  hasSpecificTables?: boolean;
  tableCount?: number;
  tables?: string[];
  status: string;
  error?: string;
}

@Injectable()
export class TenantSchemaManagerService implements OnModuleInit {
  private readonly logger = new Logger(TenantSchemaManagerService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly tenantMigrationService: TenantMigrationService,
  ) {}

  /**
   * Executa automaticamente ao iniciar o módulo
   */
  async onModuleInit(): Promise<void> {
    this.logger.log(
      '🚀 Iniciando gerenciamento automático de schemas de tenant...',
    );

    try {
      await this.initializeTenantSchemas();
      this.logger.log('✅ Gerenciamento de schemas concluído com sucesso!');
    } catch (error: unknown) {
      // Tipado como unknown
      this.logger.error('❌ Erro no gerenciamento de schemas:', error);
      // Não falhar o startup do aplicativo por causa de schemas
    }
  }

  /**
   * Inicializa e corrige todos os schemas de tenant
   */
  private async initializeTenantSchemas(): Promise<void> {
    this.logger.log('🔍 Verificando tenants existentes...');

    // Buscar todos os tenants ativos
    const tenants = await this.dataSource.query<TenantInfo[]>(`
      SELECT id, name, slug, "isActive" 
      FROM tenant 
      WHERE "isActive" = true
      ORDER BY id
    `);

    this.logger.log(`📋 Encontrados ${tenants.length} tenants ativos`);

    for (const tenant of tenants) {
      await this.processTenantSchema(tenant);
    }
  }

  /**
   * Processa o schema de um tenant específico
   */
  private async processTenantSchema(tenant: TenantInfo): Promise<void> {
    const { name, slug } = tenant;

    this.logger.log(`🏢 Processando tenant: ${name} (${slug})`);

    try {
      // 1. Verificar se o schema existe
      const schemaExists = await this.checkSchemaExists(slug);

      if (!schemaExists) {
        this.logger.log(`📁 Schema ${slug} não existe, criando...`);
        await this.createSchema(slug);
      }

      // 2. Listar tabelas atuais
      const currentTables = await listTenantTables(slug);
      this.logger.log(
        `📊 Tabelas atuais em ${slug}: ${currentTables.join(', ')}`,
      );

      // 3. Verificar se há tabelas duplicadas
      const hasDuplicates = this.hasDuplicateTables(currentTables);

      if (hasDuplicates) {
        this.logger.warn(
          `⚠️  Tabelas duplicadas encontradas em ${slug}, limpando...`,
        );
        await cleanupTenantSchema(slug);
      }

      // 4. Verificar se as tabelas específicas existem
      const hasSpecificTables = this.hasSpecificTables(currentTables);

      if (!hasSpecificTables) {
        this.logger.log(
          `🔧 Tabelas específicas não encontradas em ${slug}, criando...`,
        );
        await this.tenantMigrationService.migrateTenantSchema(slug);
      } else {
        this.logger.log(`✅ Schema ${slug} já está correto`);
      }
    } catch (error: unknown) {
      // Tipado como unknown
      this.logger.error(`❌ Erro ao processar tenant ${slug}:`, error);
    }
  }

  /**
   * Verifica se um schema existe
   */
  private async checkSchemaExists(schemaName: string): Promise<boolean> {
    const result = await this.dataSource.query<{ exists: boolean }[]>(
      `
      SELECT EXISTS (
        SELECT FROM information_schema.schemata 
        WHERE schema_name = $1
      );
    `,
      [schemaName],
    );

    return result[0].exists;
  }

  /**
   * Cria um novo schema
   */
  private async createSchema(schemaName: string): Promise<void> {
    await this.dataSource.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}";`);
    this.logger.log(`✅ Schema ${schemaName} criado`);
  }

  /**
   * Verifica se há tabelas duplicadas (globais no schema isolado)
   */
  private hasDuplicateTables(tables: string[]): boolean {
    const globalTables = [
      'tenant',
      'user',
      'software',
      'software_license',
      'software_licenses',
    ];
    return globalTables.some((table) => tables.includes(table));
  }

  /**
   * Verifica se as tabelas específicas do tenant existem
   */
  private hasSpecificTables(tables: string[]): boolean {
    const specificTables = ['branch', 'branch_data', 'branch_permission'];

    const existingSpecificTables = specificTables.filter((table) =>
      tables.includes(table),
    );
    // Garante que todas as tabelas gerenciadas pelo ORM existam.
    return existingSpecificTables.length >= specificTables.length;
  }

  /**
   * Método público para forçar a correção de um tenant específico
   */
  async fixTenantSchema(tenantSlug: string): Promise<void> {
    this.logger.log(`🔧 Forçando correção do schema: ${tenantSlug}`);

    try {
      // Buscar informações do tenant
      const tenant = await this.dataSource.query<TenantInfo[]>(
        `
        SELECT id, name, slug, "isActive" 
        FROM tenant 
        WHERE slug = $1
      `,
        [tenantSlug],
      );

      if (tenant.length === 0) {
        throw new Error(`Tenant ${tenantSlug} não encontrado`);
      }

      await this.processTenantSchema(tenant[0]);
    } catch (error: unknown) {
      // Tipado como unknown
      this.logger.error(`❌ Erro ao corrigir schema ${tenantSlug}:`, error);
      throw error;
    }
  }

  /**
   * Método público para listar status de todos os schemas
   */
  async getSchemasStatus(): Promise<TenantSchemaStatus[]> {
    const tenants = await this.dataSource.query<TenantInfo[]>(`
      SELECT id, name, slug, "isActive" 
      FROM tenant 
      WHERE "isActive" = true
      ORDER BY id
    `);

    const status: TenantSchemaStatus[] = [];

    for (const tenant of tenants) {
      try {
        const tables = await listTenantTables(tenant.slug);
        const hasDuplicates = this.hasDuplicateTables(tables);
        const hasSpecificTables = this.hasSpecificTables(tables);
        const schemaExists = await this.checkSchemaExists(tenant.slug);

        status.push({
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          schemaExists,
          hasDuplicates,
          hasSpecificTables,
          tableCount: tables.length,
          tables: tables,
          status: this.getSchemaStatus(
            hasDuplicates,
            hasSpecificTables,
            schemaExists,
          ),
        });
      } catch (error: unknown) {
        // Tipado como unknown
        status.push({
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          error: error instanceof Error ? error.message : 'Unknown error', // Acessa message de forma segura
          status: 'ERROR',
        });
      }
    }

    return status;
  }

  /**
   * Determina o status do schema
   */
  private getSchemaStatus(
    hasDuplicates: boolean,
    hasSpecificTables: boolean,
    schemaExists: boolean,
  ): string {
    if (!schemaExists) return 'MISSING_SCHEMA';
    if (hasDuplicates) return 'HAS_DUPLICATES';
    if (!hasSpecificTables) return 'MISSING_TABLES';
    return 'OK';
  }
}
