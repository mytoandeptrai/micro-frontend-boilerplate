import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm"

export enum SettingsTheme {
  LIGHT = "light",
  DARK = "dark",
}

@Entity("settings")
export class Settings {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  workspaceName: string

  @Column()
  timezone: string

  @Column({ type: "enum", enum: SettingsTheme, default: SettingsTheme.DARK })
  theme: SettingsTheme

  @Column({ default: true })
  inAppNotifications: boolean

  @Column({ default: true })
  memberJoinAlert: boolean

  @UpdateDateColumn()
  updatedAt: Date
}
