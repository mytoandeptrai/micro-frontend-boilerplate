import { Link, useNavigate } from "react-router-dom"

import { Card, CardContent, CardHeader, CardTitle } from "@ops/ui/components/card"

import RegisterForm, { type RegisterFormValues } from "../components/auth/RegisterForm"
import { useRegister } from "../hooks/useAuth"

export default function RegisterPage() {
  const navigate = useNavigate()
  const register = useRegister()

  function handleSubmit(values: RegisterFormValues) {
    register.mutate(values, {
      onSuccess: () => navigate("/", { replace: true }),
    })
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm items-center p-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <RegisterForm
            onSubmit={handleSubmit}
            isSubmitting={register.isPending}
            errorMessage={(register.error as Error | null)?.message}
          />
          <p className="text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
