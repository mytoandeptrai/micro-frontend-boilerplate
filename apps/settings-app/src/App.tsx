import "./styles/globals.css"
import { Toaster } from "@ops/ui/components/sonner"
import { NuqsAdapter } from "nuqs/adapters/react-router/v6"
import { NavLink, Outlet, Route, Routes } from "react-router-dom"
import GeneralSettings from "./pages/GeneralSettings"
import NotificationSettings from "./pages/NotificationSettings"
import ThemeSettings from "./pages/ThemeSettings"

const tabs = [
  { to: "", label: "General", end: true },
  { to: "notifications", label: "Notifications" },
  { to: "theme", label: "Theme" },
]

function SettingsLayout() {
  return (
    <div>
      <nav className="flex gap-1 border-b border-border px-6 pt-4">
        {tabs.map(({ to, label, end }) => (
          <NavLink
            key={label}
            to={to}
            end={end}
            className={({ isActive }) =>
              `rounded-t px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  )
}

export default function App() {
  return (
    <NuqsAdapter>
      <Routes>
        <Route element={<SettingsLayout />}>
          <Route index element={<GeneralSettings />} />
          <Route path="notifications" element={<NotificationSettings />} />
          <Route path="theme" element={<ThemeSettings />} />
        </Route>
      </Routes>
      <Toaster />
    </NuqsAdapter>
  )
}
