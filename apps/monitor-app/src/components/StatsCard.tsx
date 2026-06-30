import { Card, CardContent, CardHeader, CardTitle } from "@ops/ui/components/card"
import type { LucideIcon } from "lucide-react"

interface StatsCardProps {
  label: string
  value: number | undefined
  isLoading?: boolean
  icon?: LucideIcon
  variant?: "default" | "success"
}

export function StatsCard({ label, value, isLoading, icon: Icon, variant = "default" }: StatsCardProps) {
  return (
    <Card className="rounded-xl border shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {label}
          </CardTitle>
          {Icon && (
            <Icon
              className={variant === "success" ? "size-4 text-emerald-500" : "size-4 text-muted-foreground"}
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-8 w-12 animate-pulse rounded bg-muted" />
        ) : (
          <p className={`text-3xl font-bold tracking-tight ${variant === "success" ? "text-emerald-600 dark:text-emerald-400" : ""}`}>
            {value ?? "—"}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
