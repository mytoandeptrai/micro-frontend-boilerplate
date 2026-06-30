import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm"

@Entity("stats")
export class Stats {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ default: 0 })
  totalMembers: number

  @Column({ default: 0 })
  activeMembers: number

  @Column({ default: 0 })
  adminCount: number

  @Column({ default: 0 })
  memberCount: number

  @Column({ default: 0 })
  viewerCount: number

  @UpdateDateColumn()
  updatedAt: Date
}
