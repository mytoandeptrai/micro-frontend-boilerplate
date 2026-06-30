import { useStore } from "@ops/shared"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useLogout } from "../hooks/useAuth"

export default function Header() {
  const { theme, setTheme } = useTheme()
  const user = useStore.use.user()
  const logoutMutation = useLogout()

  function toggleTheme() {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
      <span className="text-sm font-semibold">Ops Dashboard</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        {user && (
          <>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-muted-foreground">{user.name}</span>
            <button
              type="button"
              onClick={() => logoutMutation.mutate()}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  )
}
