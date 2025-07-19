import { DataSource } from 'typeorm';
import { cleanupTenantSchema, listTenantTables } from '../shared/database/cleanup-tenant-schema';

/**
 * Script para limpar todos os schemas de tenant
 * Remove tabelas duplicadas de todos os tenants existentes
 */
async function cleanupAllTenantSchemas(): Promise<void> {
  // Conexão com o schema global para listar tenants
  const globalConnection = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    schema: 'public',
  });

  await globalConnection.initialize();

  try {
    console.log('🔍 Buscando todos os tenants...');
    
    // Listar todos os tenants
    const tenants = await globalConnection.query(`
      SELECT slug FROM tenant WHERE is_active = true
    `);

    console.log(`📋 Encontrados ${tenants.length} tenants ativos`);

    for (const tenant of tenants) {
      const tenantSlug = tenant.slug;
      console.log(`\n🏢 Processando tenant: ${tenantSlug}`);
      
      try {
        // Listar tabelas antes da limpeza
        const tablesBefore = await listTenantTables(tenantSlug);
        console.log(`📊 Tabelas antes da limpeza: ${tablesBefore.join(', ')}`);
        
        // Limpar schema
        await cleanupTenantSchema(tenantSlug);
        
        // Listar tabelas depois da limpeza
        const tablesAfter = await listTenantTables(tenantSlug);
        console.log(`📊 Tabelas depois da limpeza: ${tablesAfter.join(', ')}`);
        
      } catch (error) {
        console.error(`❌ Erro ao processar tenant ${tenantSlug}:`, error);
      }
    }

    console.log('\n✅ Limpeza de todos os schemas concluída!');

  } catch (error) {
    console.error('❌ Erro na limpeza:', error);
  } finally {
    await globalConnection.destroy();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  cleanupAllTenantSchemas()
    .then(() => {
      console.log('🎉 Script executado com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erro na execução:', error);
      process.exit(1);
    });
}

export { cleanupAllTenantSchemas }; 