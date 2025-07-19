import { Injectable, Logger } from '@nestjs/common';
import { getSoftwareConnection } from './software-connection';

@Injectable()
export class SoftwareMigrationService {
  private readonly logger = new Logger(SoftwareMigrationService.name);

  /**
   * Provisiona o schema e as tabelas do software para o tenant
   */
  async provisionSoftwareSchema(
    softwareCode: string,
    tenantSlug: string,
  ): Promise<void> {
    const connection = await getSoftwareConnection(softwareCode, tenantSlug);
    const schemaName = `software_${softwareCode}_tenant_${tenantSlug}`;

    try {
      this.logger.log(`Provisionando schema: ${schemaName}`);
      // Exemplo: criar tabelas básicas para um ERP
      if (softwareCode === 'erp') {
        await connection.query(`
          CREATE TABLE IF NOT EXISTS "${schemaName}".branches (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            code VARCHAR(50) UNIQUE NOT NULL,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
          CREATE TABLE IF NOT EXISTS "${schemaName}".departments (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            code VARCHAR(50) UNIQUE NOT NULL,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
      }
      // Exemplo: criar tabelas básicas para um CRM
      if (softwareCode === 'crm') {
        await connection.query(`
          CREATE TABLE IF NOT EXISTS "${schemaName}".customers (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
          CREATE TABLE IF NOT EXISTS "${schemaName}".leads (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            status VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
      }
      // Adicione outros softwares conforme necessário
      this.logger.log(`Schema ${schemaName} provisionado com sucesso!`);
    } catch (error) {
      this.logger.error(`Erro ao provisionar schema ${schemaName}:`, error);
      throw error;
    }
  }
}
