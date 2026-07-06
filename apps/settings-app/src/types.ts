export type SettingsTheme = "light" | "dark"

export interface Settings {
  id: string
  workspaceName: string
  timezone: string
  theme: SettingsTheme
  inAppNotifications: boolean
  memberJoinAlert: boolean
  updatedAt: string
}

export type UpdateSettingsPayload = Partial<Omit<Settings, "id" | "updatedAt">>
