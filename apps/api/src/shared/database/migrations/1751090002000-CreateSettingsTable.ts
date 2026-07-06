import type { MigrationInterface, QueryRunner } from "typeorm"

export class CreateSettingsTable1751090002000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."settings_theme_enum" AS ENUM('light', 'dark')
    `)

    await queryRunner.query(`
      CREATE TABLE "settings" (
        "id"                  uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "workspaceName"       character varying NOT NULL,
        "timezone"            character varying NOT NULL,
        "theme"               "public"."settings_theme_enum" NOT NULL DEFAULT 'dark',
        "inAppNotifications"  boolean NOT NULL DEFAULT true,
        "memberJoinAlert"     boolean NOT NULL DEFAULT true,
        "updatedAt"           TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_settings" PRIMARY KEY ("id")
      )
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "settings"`)
    await queryRunner.query(`DROP TYPE "public"."settings_theme_enum"`)
  }
}
