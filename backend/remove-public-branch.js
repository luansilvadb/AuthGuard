const { DataSource } = require('typeorm');
require('dotenv').config();

async function removePublicBranchTable() {
  console.log('🔴 Removendo tabela branch do schema public...');
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
    await dataSource.query('DROP TABLE IF EXISTS public.branch CASCADE;');
    console.log('✅ Tabela branch removida do schema public!');
  } catch (error) {
    console.error('❌ Erro ao remover tabela branch do public:', error);
  } finally {
    await dataSource.destroy();
  }
}

removePublicBranchTable(); 