const { DataSource } = require('typeorm');
require('dotenv').config();

async function testBranchCreation() {
  console.log('🔍 Testando criação de filiais...');
  
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    schema: 'public',
  });

  await dataSource.initialize();

  try {
    // 1. Verificar se existe a matriz tenant_mm
    console.log('1. Verificando matriz tenant_mm...');
    const matrixTenant = await dataSource.query(
      'SELECT * FROM tenant WHERE slug = $1',
      ['tenant_mm']
    );
    
    if (matrixTenant.length === 0) {
      console.log('❌ Matriz tenant_mm não encontrada');
      return;
    }
    
    console.log('✅ Matriz encontrada:', matrixTenant[0]);

    // 2. Conectar ao schema da matriz
    console.log('2. Conectando ao schema da matriz...');
    const matrixConnection = new DataSource({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      schema: 'tenant_mm',
    });

    await matrixConnection.initialize();

    // 3. Verificar se a tabela branch existe
    console.log('3. Verificando tabela branch...');
    const branchTableExists = await matrixConnection.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'tenant_mm' 
        AND table_name = 'branch'
      );
    `);

    if (!branchTableExists[0]?.exists) {
      console.log('❌ Tabela branch não existe no schema da matriz');
      return;
    }

    console.log('✅ Tabela branch existe');

    // 4. Verificar filiais existentes
    console.log('4. Verificando filiais existentes...');
    const existingBranches = await matrixConnection.query(
      'SELECT * FROM branch WHERE "isActive" = true ORDER BY "createdAt"'
    );

    console.log(`✅ Encontradas ${existingBranches.length} filiais:`);
    existingBranches.forEach(branch => {
      console.log(`   - ${branch.name} (${branch.slug}) - ${branch.description}`);
    });

    // 5. Criar uma filial de teste
    console.log('5. Criando filial de teste...');
    const testBranchName = 'Filial Teste ' + Date.now();
    const testBranchSlug = 'filial_teste_' + Date.now();
    
    const newBranch = await matrixConnection.query(`
      INSERT INTO branch (name, slug, "matrixTenantId", "isActive", description, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `, [
      testBranchName,
      testBranchSlug,
      matrixTenant[0].id,
      true,
      'Filial de teste criada pelo script'
    ]);

    console.log('✅ Filial de teste criada:', newBranch[0]);

    // 6. Verificar filiais novamente
    console.log('6. Verificando filiais após criação...');
    const updatedBranches = await matrixConnection.query(
      'SELECT * FROM branch WHERE "isActive" = true ORDER BY "createdAt"'
    );

    console.log(`✅ Agora temos ${updatedBranches.length} filiais:`);
    updatedBranches.forEach(branch => {
      console.log(`   - ${branch.name} (${branch.slug}) - ${branch.description}`);
    });

    // 7. Limpar filial de teste
    console.log('7. Removendo filial de teste...');
    await matrixConnection.query(
      'DELETE FROM branch WHERE slug = $1',
      [testBranchSlug]
    );
    console.log('✅ Filial de teste removida');

    await matrixConnection.destroy();
    console.log('🎉 Teste concluído com sucesso!');

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    await dataSource.destroy();
  }
}

testBranchCreation(); 