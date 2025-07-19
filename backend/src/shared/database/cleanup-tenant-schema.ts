import { DataSource } from 'typeorm';

/**
 * Script para limpar tabelas duplicadas dos schemas de tenant
 * Remove tabelas globais que foram criadas incorretamente nos schemas isolados
 */
export async function cleanupTenantSchema(tenantSlug: string): Promise<void> {
  const connection = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    schema: tenantSlug,
  });

  await connection.initialize();

  try {
    console.log(`🧹 Limpando schema do tenant: ${tenantSlug}`);

    // Lista de tabelas globais que NÃO deveriam estar no schema isolado
    const globalTablesToRemove = [
      'tenant',
      'user', 
      'software',
      'software_license',
      'software_licenses', // variação do nome
    ];

    for (const tableName of globalTablesToRemove) {
      try {
        // Verificar se a tabela existe
        const tableExists = await connection.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = '${tenantSlug}' 
            AND table_name = '${tableName}'
          );
        `);

        if (tableExists[0].exists) {
          console.log(`🗑️  Removendo tabela duplicada: ${tableName}`);
          await connection.query(`DROP TABLE IF EXISTS "${tenantSlug}"."${tableName}" CASCADE;`);
          console.log(`✅ Tabela ${tableName} removida com sucesso`);
        } else {
          console.log(`ℹ️  Tabela ${tableName} não existe no schema ${tenantSlug}`);
        }
      } catch (error) {
        console.error(`❌ Erro ao remover tabela ${tableName}:`, error);
      }
    }

    console.log(`✅ Limpeza do schema ${tenantSlug} concluída`);

  } catch (error) {
    console.error(`❌ Erro na limpeza do schema ${tenantSlug}:`, error);
    throw error;
  } finally {
    await connection.destroy();
  }
}

/**
 * Função para listar todas as tabelas de um schema
 */
export async function listTenantTables(tenantSlug: string): Promise<string[]> {
  const connection = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    schema: tenantSlug,
  });

  await connection.initialize();

  try {
    const result = await connection.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = '${tenantSlug}'
      ORDER BY table_name;
    `);

    return result.map((row: any) => row.table_name);
  } finally {
    await connection.destroy();
  }
} 