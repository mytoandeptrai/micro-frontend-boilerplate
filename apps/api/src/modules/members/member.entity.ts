import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm"

export enum MemberRole {
  ADMIN = "admin",
  MEMBER = "member",
  VIEWER = "viewer",
}

export enum MemberStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

@Entity("members")
export class Member {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  name: string

  @Column({ unique: true })
  email: string

  @Column({ type: "enum", enum: MemberRole })
  role: MemberRole

  @Column({ select: false, nullable: true })
  password: string | null

  @Column({ nullable: true })
  avatar: string

  @Column({ type: "enum", enum: MemberStatus, default: MemberStatus.ACTIVE })
  status: MemberStatus

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
