import { DataSource, DataSourceOptions } from 'typeorm';

const tenantDataSources: Map<string, DataSource> = new Map();

export const getTenantConnection = async (
  tenantSlug: string,
): Promise<DataSource> => {
  const schemaName = tenantSlug;

  if (tenantDataSources.has(schemaName)) {
    return tenantDataSources.get(schemaName)!;
  }

  const options: DataSourceOptions = {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    schema: schemaName,
    // Não carregar entidades automaticamente - usar apenas migrações manuais
    entities: [__dirname + '/../../tenants/entities/*.entity{.ts,.js}'],
    synchronize: false, // Desabilitar sincronização automática
  };

  const dataSource = new DataSource(options);
  await dataSource.initialize(); // Use await here
  tenantDataSources.set(schemaName, dataSource);

  return dataSource;
};
