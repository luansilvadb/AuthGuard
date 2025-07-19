import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { getTenantConnection } from './tenant-connection';

interface QueryResult {
  exists: boolean;
}

@Injectable()
export class TenantMigrationService {
  private readonly logger = new Logger(TenantMigrationService.name);

  constructor(private dataSource: DataSource) {}

  /**
   * Executa a migração completa para um tenant específico
   */
  async migrateTenantSchema(tenantSlug: string): Promise<void> {
    this.logger.log(`Executando migração para o schema: ${tenantSlug}`);

    try {
      const tenantConnection = await getTenantConnection(tenantSlug);

      // Garante que a conexão está inicializada
      if (!tenantConnection.isInitialized) {
        await tenantConnection.initialize();
      }

      // Sincronizar o schema com base nas entidades
      await tenantConnection.synchronize();

      this.logger.log(`Migração concluída para o schema: ${tenantSlug}`);
    } catch (error) {
      this.logger.error(`Erro na migração do schema ${tenantSlug}:`, error);
      throw error;
    }
  }

  /**
   * Verifica se o schema do tenant já foi migrado
   */
  async isTenantMigrated(tenantSlug: string): Promise<boolean> {
    try {
      const connection = await getTenantConnection(tenantSlug);

      // Verifica se a tabela branch existe (indicador de que a migração foi executada)
      const result = await connection.query<QueryResult[]>(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = '${tenantSlug}' 
          AND table_name = 'branch'
        );
      `);

      // Verifica se o resultado não é vazio e se a propriedade 'exists' é verdadeira
      return result.length > 0 && result[0].exists;
    } catch (error) {
      this.logger.error(
        `Erro ao verificar migração do tenant ${tenantSlug}:`,
        error,
      );
      return false;
    }
  }

  /**
   * Força a migração de um tenant (útil para desenvolvimento)
   */
  async forceMigrateTenant(tenantSlug: string): Promise<void> {
    this.logger.warn(`Forçando migração para tenant: ${tenantSlug}`);
    await this.migrateTenantSchema(tenantSlug);
  }
}
