import { useEventSubscription } from "@ops/shared"
import { useTheme } from "next-themes"
import { useEffect } from "react"
import { useSettings } from "../hooks/useSettings"

export default function ThemeSync() {
  const { setTheme } = useTheme()
  const { data: settings } = useSettings()

  useEventSubscription("theme:change", ({ theme }) => {
    setTheme(theme)
  })

  useEffect(() => {
    if (settings) setTheme(settings.theme)
  }, [settings, setTheme])

  return null
}
