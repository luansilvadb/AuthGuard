import { DataSource } from 'typeorm';
import { databaseConfig } from '@/config/database.config';
import { ConfigService } from '@nestjs/config';

/**
 * Executa todas as migrações TypeORM no schema informado.
 * Cria uma conexão temporária com search_path setado para o schema.
 */
export async function runMigrationsForSchema(schemaName: string): Promise<void> {
  // Use as mesmas configs do projeto, mas alterando o search_path
  const configService = new ConfigService();
  const baseConfig = databaseConfig(configService);

  // Remove 'schema' pois não é aceito em DataSourceOptions para Postgres
  const { schema, ...dataSourceConfig } = baseConfig as any;

  // search_path para queries/migrations
  const dataSource = new DataSource({
    ...dataSourceConfig,
    migrationsTableName: 'migrations',
    extra: {
      ...((dataSourceConfig as any).extra || {}),
      options: `-c search_path=${schemaName},public`,
    },
  });

  try {
    await dataSource.initialize();
    // Garante que o search_path está correto
    await dataSource.query(`SET search_path TO "${schemaName}", public`);
    console.log(`🔄 Rodando migrações no schema: ${schemaName}`);
    await dataSource.runMigrations();
    console.log(`✅ Migrações aplicadas no schema: ${schemaName}`);
  } catch (error) {
    console.error(`❌ Erro ao rodar migrações no schema ${schemaName}:`, error);
    throw error;
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
} 