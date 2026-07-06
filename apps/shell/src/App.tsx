import React, { Suspense } from "react"
import { EventDebugger } from "@ops/ui/devtools"
import { BrowserRouter, Navigate, Outlet, type RouteObject, useRoutes } from "react-router-dom"
import GuestRoute from "./components/GuestRoute"
import ProtectedRoute from "./components/ProtectedRoute"
import Header from "./layout/Header"
import Sidebar from "./layout/Sidebar"
import DashboardPage from "./pages/DashboardPage"
import LoginPage from "./pages/LoginPage"

const TeamApp = React.lazy(() => import("teamApp/App"))
const MonitorApp = React.lazy(() => import("monitorApp/App"))
const SettingsApp = React.lazy(() => import("settingsApp/App"))

function AppLayout() {
  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Suspense fallback={<div className="p-6">Loading…</div>}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}

const routes: RouteObject[] = [
  {
    path: "login",
    element: <GuestRoute><LoginPage /></GuestRoute>,
  },
  {
    path: "/",
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "team/*", element: <TeamApp /> },
      { path: "monitor/*", element: <MonitorApp /> },
      { path: "settings/*", element: <SettingsApp /> },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]

function AppRoutes() {
  return useRoutes(routes)
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      {import.meta.env.DEV && <EventDebugger />}
    </BrowserRouter>
  )
}
