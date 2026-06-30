interface EmptyStateProps {
  hasFilters: boolean
}

export function EmptyState({ hasFilters }: EmptyStateProps) {
  return (
    <div className="text-muted-foreground flex h-24 items-center justify-center text-xs">
      {hasFilters ? "No matching events" : "Listening… no events yet"}
    </div>
  )
}
