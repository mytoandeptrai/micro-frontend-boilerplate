import { publishEvent } from "@ops/shared"
import { Button } from "@ops/ui/components/button"
import { useSettings } from "../hooks/useSettings"
import { useUpdateSettings } from "../hooks/useUpdateSettings"
import type { SettingsTheme } from "../types"

export default function ThemeSettings() {
  const { data: settings, isLoading } = useSettings()
  const updateMutation = useUpdateSettings()

  if (isLoading)
    return <div className="p-6 text-sm text-muted-foreground">Loading...</div>

  function handleSelect(theme: SettingsTheme) {
    publishEvent("theme:change", { theme })
    updateMutation.mutate({ theme })
  }

  return (
    <div className="max-w-lg space-y-6 p-6">
      <h1 className="font-heading text-sm font-semibold">Theme</h1>
      <div className="flex gap-2">
        <Button
          type="button"
          variant={settings?.theme === "light" ? "default" : "outline"}
          onClick={() => handleSelect("light")}
        >
          Light
        </Button>
        <Button
          type="button"
          variant={settings?.theme === "dark" ? "default" : "outline"}
          onClick={() => handleSelect("dark")}
        >
          Dark
        </Button>
      </div>
    </div>
  )
}
