import { Button } from "@ops/ui/components/button"

interface TaskErrorStateProps {
  message?: string
  onRetry: () => void
}

export default function TaskErrorState({ message, onRetry }: TaskErrorStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 py-12 text-center" role="alert">
      <p className="text-sm font-medium text-destructive">Failed to load tasks</p>
      <p className="text-xs text-muted-foreground">{message ?? "Something went wrong."}</p>
      <Button type="button" variant="outline" size="sm" onClick={onRetry}>
        Retry
      </Button>
    </div>
  )
}
