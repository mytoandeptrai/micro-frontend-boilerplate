import type { MigrationInterface, QueryRunner } from "typeorm"

export class AddPasswordToMember1751090000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "members" ADD COLUMN IF NOT EXISTS "password" character varying NOT NULL DEFAULT ''`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "members" DROP COLUMN IF EXISTS "password"`)
  }
}
