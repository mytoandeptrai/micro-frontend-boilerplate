import { useStore } from "@ops/shared/store"
import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useLogin } from "../hooks/useAuth"

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const setUser = useStore.use.setUser()
  const setAuthenticated = useStore.use.setAuthenticated()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const returnUrl = (location.state as { returnUrl?: string })?.returnUrl ?? "/"
  const loginMutation = useLogin()

  function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    loginMutation.mutate(
      { email, password },
      {
        onSuccess: (member) => {
          setUser(member)
          setAuthenticated(true)
          navigate(returnUrl, { replace: true })
        },
      },
    )
  }

  const errorMsg = loginMutation.isError
    ? loginMutation.error instanceof Error
      ? loginMutation.error.message
      : "Something went wrong. Please try again."
    : ""

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-8 shadow-sm">
        <h1 className="mb-6 text-2xl font-semibold text-foreground">Sign in</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-foreground">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="you@ops.dev"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-foreground">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="••••••••"
            />
          </div>
          {errorMsg && (
            <p role="alert" className="text-sm text-destructive">
              {errorMsg}
            </p>
          )}
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {loginMutation.isPending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  )
}
