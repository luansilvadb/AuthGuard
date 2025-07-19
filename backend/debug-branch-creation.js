const { DataSource } = require('typeorm');
require('dotenv').config();

async function debugBranchCreation() {
  console.log('🔍 Debugando criação de filiais...');
  
  // Conexão com schema public
  const publicDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    schema: 'public',
  });

  // Conexão com schema tenant_leandro
  const tenantDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    schema: 'tenant_leandro',
  });

  await publicDataSource.initialize();
  await tenantDataSource.initialize();

  try {
    // 1. Verificar se existe tabela branch no schema public
    console.log('1. Verificando tabela branch no schema public...');
    const publicBranchExists = await publicDataSource.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'branch'
      );
    `);
    
    if (publicBranchExists[0]?.exists) {
      console.log('⚠️  Tabela branch existe no schema public!');
      
      // Verificar se há dados na tabela branch do public
      const publicBranches = await publicDataSource.query(
        'SELECT * FROM branch ORDER BY "createdAt"'
      );
      console.log(`   Encontradas ${publicBranches.length} filiais no schema public:`);
      publicBranches.forEach(branch => {
        console.log(`   - ${branch.name} (${branch.slug}) - ${branch.description}`);
      });
    } else {
      console.log('✅ Tabela branch NÃO existe no schema public');
    }

    // 2. Verificar tabela branch no schema tenant_leandro
    console.log('\n2. Verificando tabela branch no schema tenant_leandro...');
    const tenantBranchExists = await tenantDataSource.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'tenant_leandro' 
        AND table_name = 'branch'
      );
    `);
    
    if (tenantBranchExists[0]?.exists) {
      console.log('✅ Tabela branch existe no schema tenant_leandro');
      
      // Verificar dados na tabela branch do tenant
      const tenantBranches = await tenantDataSource.query(
        'SELECT * FROM branch ORDER BY "createdAt"'
      );
      console.log(`   Encontradas ${tenantBranches.length} filiais no schema tenant_leandro:`);
      tenantBranches.forEach(branch => {
        console.log(`   - ${branch.name} (${branch.slug}) - ${branch.description}`);
      });
    } else {
      console.log('❌ Tabela branch NÃO existe no schema tenant_leandro');
    }

    // 3. Testar a função getTenantConnection
    console.log('\n3. Testando função getTenantConnection...');
    const { getTenantConnection } = require('./src/shared/database/tenant-connection.ts');
    
    try {
      const tenantConnection = await getTenantConnection('tenant_leandro');
      console.log('✅ getTenantConnection conectou com sucesso');
      
      // Verificar qual schema está sendo usado
      const currentSchema = await tenantConnection.query('SELECT current_schema()');
      console.log(`   Schema atual: ${currentSchema[0].current_schema}`);
      
      // Tentar criar uma filial de teste
      console.log('\n4. Criando filial de teste...');
      const testBranchName = 'Filial Debug ' + Date.now();
      const testBranchSlug = 'filial_debug_' + Date.now();
      
      const newBranch = await tenantConnection.query(`
        INSERT INTO branch (name, slug, "matrixTenantId", "isActive", description, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *
      `, [
        testBranchName,
        testBranchSlug,
        1, // matrixTenantId
        true,
        'Filial de teste para debug'
      ]);

      console.log('✅ Filial de teste criada:', newBranch[0]);
      
      // Verificar onde foi criada
      console.log('\n5. Verificando onde a filial foi criada...');
      
      // Verificar no schema tenant_leandro
      const tenantBranchesAfter = await tenantDataSource.query(
        'SELECT * FROM branch WHERE slug = $1',
        [testBranchSlug]
      );
      
      if (tenantBranchesAfter.length > 0) {
        console.log('✅ Filial criada corretamente no schema tenant_leandro');
      } else {
        console.log('❌ Filial NÃO foi criada no schema tenant_leandro');
      }
      
      // Verificar no schema public
      const publicBranchesAfter = await publicDataSource.query(
        'SELECT * FROM branch WHERE slug = $1',
        [testBranchSlug]
      );
      
      if (publicBranchesAfter.length > 0) {
        console.log('❌ Filial foi criada incorretamente no schema public');
      } else {
        console.log('✅ Filial NÃO foi criada no schema public (correto)');
      }
      
      // Limpar filial de teste
      await tenantConnection.query(
        'DELETE FROM branch WHERE slug = $1',
        [testBranchSlug]
      );
      console.log('✅ Filial de teste removida');

    } catch (error) {
      console.error('❌ Erro ao testar getTenantConnection:', error);
    }

  } catch (error) {
    console.error('❌ Erro no debug:', error);
  } finally {
    await publicDataSource.destroy();
    await tenantDataSource.destroy();
  }
}

debugBranchCreation(); 