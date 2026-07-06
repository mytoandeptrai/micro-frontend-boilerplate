import { useStore } from "@ops/shared-core"
import { Button } from "@ops/ui/components/button"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export default function Header() {
  const user = useStore.use.user()
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
      <span className="text-sm font-semibold">Task Board</span>
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Toggle theme"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        >
          {resolvedTheme === "dark" ? <Sun /> : <Moon />}
        </Button>
        {user && (
          <>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-muted-foreground">{user.name}</span>
          </>
        )}
      </div>
    </header>
  )
}
