import { MigrationInterface, QueryRunner } from 'typeorm';

export class MoveBranchTableToTenantSchemas1752802751525
  implements MigrationInterface
{
  name = 'MoveBranchTableToTenantSchemas1752802751525';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Obter todos os schemas de tenant existentes
    const tenants = (await queryRunner.query(
      `SELECT schema_name FROM information_schema.schemata WHERE schema_name LIKE 'tenant_%';`,
    )) as { schema_name: string }[];
    const tenantSchemas = tenants.map((t) => t.schema_name);

    // Para cada tenant, criar as tabelas de branch
    for (const schema of tenantSchemas) {
      await queryRunner.query(`
                CREATE TABLE "${schema}"."branch" (
                    "id" SERIAL NOT NULL,
                    "name" character varying(100) NOT NULL,
                    "slug" character varying(50) NOT NULL,
                    "description" text,
                    "matrixTenantId" integer NOT NULL,
                    "isActive" boolean NOT NULL DEFAULT true,
                    "settings" jsonb,
                    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                    CONSTRAINT "PK_branch_${schema}" PRIMARY KEY ("id"),
                    CONSTRAINT "UQ_branch_slug_${schema}" UNIQUE ("slug")
                );
            `);

      await queryRunner.query(`
                CREATE TABLE "${schema}"."branch_data" (
                    "id" SERIAL NOT NULL,
                    "branchId" integer NOT NULL,
                    "entityType" character varying(50) NOT NULL,
                    "entityId" integer NOT NULL,
                    "data" jsonb NOT NULL,
                    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                    CONSTRAINT "PK_branch_data_${schema}" PRIMARY KEY ("id")
                );
            `);

      await queryRunner.query(`
                ALTER TABLE "${schema}"."branch_data" 
                ADD CONSTRAINT "FK_branch_data_branch_${schema}" 
                FOREIGN KEY ("branchId") 
                REFERENCES "${schema}"."branch"("id") 
                ON DELETE CASCADE;
            `);

      await queryRunner.query(`
                CREATE TABLE "${schema}"."branch_permission" (
                    "id" SERIAL NOT NULL,
                    "branchId" integer NOT NULL,
                    "userId" integer NOT NULL,
                    "permission" character varying(50) NOT NULL,
                    "isActive" boolean NOT NULL DEFAULT true,
                    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                    CONSTRAINT "PK_branch_permission_${schema}" PRIMARY KEY ("id")
                );
            `);

      await queryRunner.query(`
                ALTER TABLE "${schema}"."branch_permission" 
                ADD CONSTRAINT "FK_branch_permission_branch_${schema}" 
                FOREIGN KEY ("branchId") 
                REFERENCES "${schema}"."branch"("id") 
                ON DELETE CASCADE;
            `);
    }

    // Remover tabelas do schema public (se existirem)
    await queryRunner.query(
      `DROP TABLE IF EXISTS "public"."branch_data" CASCADE;`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "public"."branch_permission" CASCADE;`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "public"."branch" CASCADE;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recriar tabelas no schema public
    await queryRunner.query(`
            CREATE TABLE "public"."branch" (
                "id" SERIAL NOT NULL,
                "name" character varying(100) NOT NULL,
                CONSTRAINT "PK_branch_public" PRIMARY KEY ("id")
            );
        `);
    // Adicione aqui a estrutura completa das tabelas legadas, se necessário, para um rollback completo.
    // Por simplicidade, estamos recriando apenas a estrutura mínima.

    // Obter todos os schemas de tenant
    const tenants = (await queryRunner.query(
      `SELECT schema_name FROM information_schema.schemata WHERE schema_name LIKE 'tenant_%';`,
    )) as { schema_name: string }[];
    const tenantSchemas = tenants.map((t) => t.schema_name);

    // Remover tabelas dos schemas de tenant
    for (const schema of tenantSchemas) {
      await queryRunner.query(
        `DROP TABLE IF EXISTS "${schema}"."branch_permission" CASCADE;`,
      );
      await queryRunner.query(
        `DROP TABLE IF EXISTS "${schema}"."branch_data" CASCADE;`,
      );
      await queryRunner.query(
        `DROP TABLE IF EXISTS "${schema}"."branch" CASCADE;`,
      );
    }
  }
}
