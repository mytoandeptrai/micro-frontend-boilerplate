import { useStore } from "@ops/shared/store"
import type { ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useStore.use.isAuthenticated()
  const isLoading = useStore.use.isLoading()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ returnUrl: location.pathname }} replace />
  }

  return <>{children}</>
}
