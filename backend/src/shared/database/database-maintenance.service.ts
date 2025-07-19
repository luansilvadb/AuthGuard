import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseMaintenanceService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseMaintenanceService.name);

  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit(): Promise<void> {
    this.logger.log('🚀 Iniciando manutenção global do banco de dados...');
    try {
      await this.maintenanceAllSchemas();
      this.logger.log('✅ Manutenção global concluída!');
    } catch (error) {
      this.logger.error('❌ Erro na manutenção global:', error);
    }
  }

  /**
   * Executa manutenção em todos os schemas
   */
  private async maintenanceAllSchemas(): Promise<void> {
    // 1. Listar todos os schemas
    const schemas = await this.getAllSchemas();
    this.logger.log(`📋 Schemas encontrados: ${schemas.join(', ')}`);

    for (const schema of schemas) {
      await this.maintenanceSchema(schema);
    }
  }

  /**
   * Executa manutenção em um schema
   */
  private async maintenanceSchema(schema: string): Promise<void> {
    this.logger.log(`\n🔧 Manutenção no schema: ${schema}`);
    const tables = await this.getTablesInSchema(schema);
    this.logger.log(`📊 Tabelas: ${tables.join(', ')}`);

    for (const table of tables) {
      await this.vacuumAnalyzeTable(schema, table);
      await this.reindexTable(schema, table);
      await this.checkDuplicates(schema, table);
    }
  }

  /**
   * Executa VACUUM e ANALYZE em uma tabela
   */
  private async vacuumAnalyzeTable(schema: string, table: string): Promise<void> {
    try {
      this.logger.log(`🧹 VACUUM/ANALYZE em ${schema}.${table}`);
      await this.dataSource.query(`VACUUM (VERBOSE, ANALYZE) "${schema}"."${table}";`);
    } catch (error) {
      this.logger.warn(`Erro no VACUUM/ANALYZE de ${schema}.${table}: ${error.message}`);
    }
  }

  /**
   * Executa REINDEX em uma tabela
   */
  private async reindexTable(schema: string, table: string): Promise<void> {
    try {
      this.logger.log(`🔄 REINDEX em ${schema}.${table}`);
      // Corrigido: REINDEX TABLE não aceita IF EXISTS no PostgreSQL
      await this.dataSource.query(`REINDEX TABLE "${schema}"."${table}";`);
    } catch (error) {
      this.logger.warn(`Erro no REINDEX de ${schema}.${table}: ${error.message}`);
    }
  }

  /**
   * Verifica duplicidade em tabelas críticas
   */
  private async checkDuplicates(schema: string, table: string): Promise<void> {
    // Tabelas críticas para duplicidade
    const critical = [
      'tenant', 'user', 'software', 'software_license',
      'branches', 'departments', 'tenant_users'
    ];
    if (!critical.includes(table)) return;

    // Colunas para checar duplicidade
    const keyColumns: Record<string, string[]> = {
      tenant: ['slug'],
      user: ['email'],
      software: ['code'], // Corrigido: software tem coluna 'code', não 'slug'
      software_license: ['tenantId', 'softwareId'],
      branches: ['code'],
      departments: ['code'],
      tenant_users: ['user_id'],
    };
    const columns = keyColumns[table];
    if (!columns) return;

    const groupBy = columns.map(c => `"${c}"`).join(', ');
    const query = `SELECT ${groupBy}, COUNT(*) as count FROM "${schema}"."${table}" GROUP BY ${groupBy} HAVING COUNT(*) > 1;`;
    try {
      const result = await this.dataSource.query(query);
      if (result.length > 0) {
        this.logger.warn(`🚨 Duplicidade encontrada em ${schema}.${table}:`, result);
      } else {
        this.logger.log(`✅ Sem duplicidade em ${schema}.${table}`);
      }
    } catch (error) {
      this.logger.warn(`Erro ao checar duplicidade em ${schema}.${table}: ${error.message}`);
    }
  }

  /**
   * Lista todos os schemas do banco
   */
  private async getAllSchemas(): Promise<string[]> {
    const result = await this.dataSource.query(`
      SELECT schema_name FROM information_schema.schemata
      WHERE schema_name NOT LIKE 'pg_%' AND schema_name != 'information_schema'
      ORDER BY schema_name;
    `);
    return result.map((row: any) => row.schema_name);
  }

  /**
   * Lista todas as tabelas de um schema
   */
  private async getTablesInSchema(schema: string): Promise<string[]> {
    const result = await this.dataSource.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = $1 AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `, [schema]);
    return result.map((row: any) => row.table_name);
  }
} 