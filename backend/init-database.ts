import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Tenant } from './src/database/entities/tenant.entity';
import { User } from './src/database/entities/user.entity';
import { Subscription } from './src/database/entities/subscription.entity';
import { License } from './src/database/entities/license.entity';
import { Application } from './src/database/entities/application.entity';

// Declaração de tipos para process.env
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DB_HOST: string;
      DB_PORT: string;
      DB_USERNAME: string;
      DB_PASSWORD: string;
      DB_NAME: string;
      NODE_ENV: string;
    }
  }
}

async function initializeDatabase() {
  console.log('🚀 Inicializando banco de dados...');
  console.log('📋 Configurações:');
  console.log(`   Host: ${process.env.DB_HOST}`);
  console.log(`   Database: ${process.env.DB_NAME}`);
  console.log(`   Username: ${process.env.DB_USERNAME}`);
  console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
  console.log('');

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [Tenant, User, Subscription, License, Application],
    synchronize: process.env.NODE_ENV === 'development', // Sincronização automática apenas em desenvolvimento
    logging: process.env.NODE_ENV === 'development',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    migrationsTableName: 'migrations',
  });

  try {
    console.log('🔄 Conectando ao banco de dados...');
    await dataSource.initialize();
    console.log('✅ Conexão estabelecida com sucesso!');

    if (process.env.NODE_ENV === 'development') {
      console.log('🏗️  Sincronizando esquemas (modo desenvolvimento)...');
      await dataSource.synchronize();
      console.log('✅ Esquemas sincronizados com sucesso!');
    } else {
      console.log('📋 Verificando migrações pendentes (modo produção)...');
      // Aqui você pode adicionar lógica para executar migrações em produção
      console.log('⚠️  Em produção, use migrações manuais: npm run migration:run');
    }

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
      tablesResult.forEach((row: any) => {
        console.log(`   - ${row.table_name}`);
      });
    } else {
      console.log('⚠️  Nenhuma tabela foi criada');
    }

    // Verificar se a tabela de migrações existe
    const migrationsTable = await dataSource.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'migrations'
    `);
    
    if (migrationsTable.length > 0) {
      console.log('✅ Tabela de migrações encontrada');
    } else {
      console.log('⚠️  Tabela de migrações não encontrada');
    }

    console.log('🎉 Banco de dados inicializado com sucesso!');
    console.log('');
    console.log('📝 Próximos passos:');
    console.log('   1. Execute: npm run seed:run');
    console.log('   2. Execute: npm run start:dev');
    console.log('');
    console.log('💡 Para desenvolvimento, use: npm run dev:setup');

  } catch (error: any) {
    console.error('❌ Erro ao inicializar banco de dados:');
    console.error(`   Código: ${error.code}`);
    console.error(`   Mensagem: ${error.message}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 Verifique se o PostgreSQL está rodando');
    } else if (error.code === '28P01') {
      console.error('💡 Verifique usuário e senha');
    } else if (error.code === '3D000') {
      console.error('💡 Verifique se o banco de dados existe');
    } else if (error.code === '42P01') {
      console.error('💡 Erro de permissão - verifique as credenciais do banco');
    }
    
    process.exit(1);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('🔌 Conexão fechada');
    }
  }
}

// Executar inicialização
initializeDatabase().catch(console.error); 