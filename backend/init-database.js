const { DataSource } = require('typeorm');
require('dotenv').config();

// Importar entidades
const { Tenant, User, Subscription, License, Application } = require('./dist/database/entities');

async function initializeDatabase() {
  console.log('🚀 Inicializando banco de dados...');
  console.log('📋 Configurações:');
  console.log(`   Host: ${process.env.DB_HOST}`);
  console.log(`   Database: ${process.env.DB_NAME}`);
  console.log(`   Username: ${process.env.DB_USERNAME}`);
  console.log('');

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [Tenant, User, Subscription, License, Application],
    synchronize: true, // Isso vai criar as tabelas automaticamente
    logging: true,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('🔄 Conectando ao banco de dados...');
    await dataSource.initialize();
    console.log('✅ Conexão estabelecida com sucesso!');

    console.log('🏗️  Sincronizando esquemas...');
    await dataSource.synchronize();
    console.log('✅ Esquemas sincronizados com sucesso!');

    // Verificar se as tabelas foram criadas
    console.log('📊 Verificando tabelas criadas...');
    const tablesResult = await dataSource.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    if (tablesResult.length > 0) {
      console.log('✅ Tabelas criadas:');
      tablesResult.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    } else {
      console.log('⚠️  Nenhuma tabela foi criada');
    }

    console.log('🎉 Banco de dados inicializado com sucesso!');
    console.log('');
    console.log('📝 Próximos passos:');
    console.log('   1. Execute: npm run seed:run');
    console.log('   2. Execute: npm run start:dev');

  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:');
    console.error(`   Código: ${error.code}`);
    console.error(`   Mensagem: ${error.message}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 Verifique se o PostgreSQL está rodando');
    } else if (error.code === '28P01') {
      console.error('💡 Verifique usuário e senha');
    } else if (error.code === '3D000') {
      console.error('💡 Verifique se o banco de dados existe');
    }
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('🔌 Conexão fechada');
    }
  }
}

// Executar inicialização
initializeDatabase().catch(console.error); 