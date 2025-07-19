import { DataSource, DataSourceOptions } from 'typeorm';

const softwareDataSources: Map<string, DataSource> = new Map();

export const getSoftwareConnection = async (
  softwareCode: string,
  tenantSlug: string,
): Promise<DataSource> => {
  const schemaName = `software_${softwareCode}_tenant_${tenantSlug}`;

  if (softwareDataSources.has(schemaName)) {
    return softwareDataSources.get(schemaName)!;
  }

  const options: DataSourceOptions = {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    schema: schemaName,
    entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
    synchronize: true,
  };

  const dataSource = new DataSource(options);
  await dataSource.initialize();
  softwareDataSources.set(schemaName, dataSource);

  return dataSource;
}; 