import type { MigrationInterface, QueryRunner } from "typeorm"

export class CreateActivityAndStats1751090001000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."activities_eventtype_enum" AS ENUM('CREATED', 'UPDATED', 'DELETED')
    `)

    await queryRunner.query(`
      CREATE TABLE "activities" (
        "id"         uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "eventType"  "public"."activities_eventtype_enum" NOT NULL,
        "actorId"    uuid              NOT NULL,
        "actorName"  character varying,
        "targetId"   uuid,
        "targetName" character varying,
        "metadata"   jsonb,
        "createdAt"  TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_activities" PRIMARY KEY ("id")
      )
    `)

    await queryRunner.query(`
      CREATE TABLE "stats" (
        "id"            uuid    NOT NULL DEFAULT uuid_generate_v4(),
        "totalMembers"  integer NOT NULL DEFAULT 0,
        "activeMembers" integer NOT NULL DEFAULT 0,
        "adminCount"    integer NOT NULL DEFAULT 0,
        "memberCount"   integer NOT NULL DEFAULT 0,
        "viewerCount"   integer NOT NULL DEFAULT 0,
        "updatedAt"     TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_stats" PRIMARY KEY ("id")
      )
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "stats"`)
    await queryRunner.query(`DROP TABLE "activities"`)
    await queryRunner.query(`DROP TYPE "public"."activities_eventtype_enum"`)
  }
}
