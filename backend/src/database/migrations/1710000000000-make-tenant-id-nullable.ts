import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeTenantIdNullable1710000000000 implements MigrationInterface {
  name = 'MakeTenantIdNullable1710000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "tenant_id" DROP NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "tenant_id" SET NOT NULL`);
  }
} 