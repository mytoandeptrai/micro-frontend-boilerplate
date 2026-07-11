import { Link, useNavigate } from "react-router-dom"

import { Card, CardContent, CardHeader, CardTitle } from "@ops/ui/components/card"

import LoginForm, { type LoginFormValues } from "../components/auth/LoginForm"
import { useLogin } from "../hooks/useAuth"

export default function LoginPage() {
  const navigate = useNavigate()
  const login = useLogin()

  function handleSubmit(values: LoginFormValues) {
    login.mutate(values, {
      onSuccess: () => navigate("/", { replace: true }),
    })
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm items-center p-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <LoginForm
            onSubmit={handleSubmit}
            isSubmitting={login.isPending}
            errorMessage={(login.error as Error | null)?.message}
          />
          <p className="text-xs text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="underline">
              Register
            </Link>
          </p>
          <p className="text-xs text-muted-foreground">Demo account: demo@test.com / demo1234</p>
        </CardContent>
      </Card>
    </div>
  )
}
