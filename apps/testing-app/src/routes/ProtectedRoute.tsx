import { Navigate, Outlet } from "react-router-dom"

import { useCurrentUser } from "../hooks/useAuth"

export default function ProtectedRoute() {
  const { data: user, isLoading } = useCurrentUser()

  if (isLoading) {
    return <p className="p-6 text-xs text-muted-foreground">Loading…</p>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
