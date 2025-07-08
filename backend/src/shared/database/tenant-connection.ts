import { DataSource, DataSourceOptions } from 'typeorm';

const tenantDataSources: Map<string, DataSource> = new Map();

export const getTenantConnection = (tenantSlug: string): DataSource => {
    const schemaName = `tenant_${tenantSlug}`;

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
        entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
        synchronize: true,
    };

    const dataSource = new DataSource(options);
    dataSource.initialize();
    tenantDataSources.set(schemaName, dataSource);

    return dataSource;
};