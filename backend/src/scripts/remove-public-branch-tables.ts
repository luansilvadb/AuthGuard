import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' }); // Carregar variáveis de ambiente

async function getGlobalDataSource(): Promise<DataSource> {
  const options: DataSourceOptions = {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [__dirname + '/../global/entities/*.entity{.ts,.js}'], // Entidades globais
    synchronize: false,
    logging: false,
  };

  const dataSource = new DataSource(options);
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }
  return dataSource;
}

async function run() {
  const dataSource = await getGlobalDataSource();
  const queryRunner = dataSource.createQueryRunner();

  await queryRunner.connect();
  
  console.log('Removendo tabelas de branch obsoletas do schema public...');

  await queryRunner.query(`DROP TABLE IF EXISTS "public"."branch_data" CASCADE;`);
  await queryRunner.query(`DROP TABLE IF EXISTS "public"."branch_permission" CASCADE;`);

  console.log('Tabelas obsoletas removidas com sucesso.');

  await queryRunner.release();
  await dataSource.destroy();
}

run().catch(console.error);