import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm"

export enum ActivityEventType {
  CREATED = "CREATED",
  UPDATED = "UPDATED",
  DELETED = "DELETED",
}

@Entity("activities")
export class Activity {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "enum", enum: ActivityEventType })
  eventType: ActivityEventType

  @Column({ type: "uuid" })
  actorId: string

  @Column({ nullable: true })
  actorName: string

  @Column({ type: "uuid", nullable: true })
  targetId: string

  @Column({ nullable: true })
  targetName: string

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, unknown> | null

  @CreateDateColumn()
  createdAt: Date
}
