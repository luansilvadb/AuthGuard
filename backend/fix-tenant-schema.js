const { DataSource } = require('typeorm');
require('dotenv').config();

async function fixTenantSchema() {
  console.log('🔧 Corrigindo schema tenant_mm...');
  
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    schema: 'tenant_mm',
  });

  await dataSource.initialize();

  try {
    // Criar tabela branch
    console.log('1. Criando tabela branch...');
    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS branch (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        "matrixTenantId" INTEGER NOT NULL,
        "isActive" BOOLEAN DEFAULT true,
        settings JSONB,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Criar tabela branch_data
    console.log('2. Criando tabela branch_data...');
    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS branch_data (
        id SERIAL PRIMARY KEY,
        "branchId" INTEGER NOT NULL,
        "entityType" VARCHAR(50) NOT NULL,
        "entityId" INTEGER NOT NULL,
        data JSONB NOT NULL,
        "isShared" BOOLEAN DEFAULT false,
        "sharedFields" JSONB,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Criar tabela branch_permission
    console.log('3. Criando tabela branch_permission...');
    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS branch_permission (
        id SERIAL PRIMARY KEY,
        "branchId" INTEGER NOT NULL,
        "userId" INTEGER NOT NULL,
        permission VARCHAR(50) NOT NULL,
        "entityTypes" JSONB,
        "isActive" BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Criar tabela products
    console.log('4. Criando tabela products...');
    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        "branchId" INTEGER
      )
    `);

    console.log('✅ Todas as tabelas foram criadas com sucesso no schema tenant_mm');

    // Verificar tabelas criadas
    console.log('5. Verificando tabelas criadas...');
    const tables = await dataSource.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'tenant_mm' 
      ORDER BY table_name
    `);

    console.log('✅ Tabelas no schema tenant_mm:');
    tables.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });

  } catch (error) {
    console.error('❌ Erro ao corrigir schema:', error);
  } finally {
    await dataSource.destroy();
  }
}

fixTenantSchema(); 