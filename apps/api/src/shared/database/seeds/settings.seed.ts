import type { DataSource } from "typeorm"
import { Settings, SettingsTheme } from "@/modules/settings/settings.entity"

export async function seedSettings(dataSource: DataSource): Promise<void> {
  const repo = dataSource.getRepository(Settings)

  const existing = await repo.count()
  if (existing > 0) {
    console.log("Settings already seeded, skipping.")
    return
  }

  await repo.save(
    repo.create({
      workspaceName: "Ops Dashboard",
      timezone: "Asia/Ho_Chi_Minh",
      theme: SettingsTheme.DARK,
      inAppNotifications: true,
      memberJoinAlert: true,
    }),
  )

  console.log("Settings seeded: 1 record created.")
}
