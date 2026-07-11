interface TaskEmptyStateProps {
  hasActiveFilters: boolean
}

export default function TaskEmptyState({ hasActiveFilters }: TaskEmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-1 py-12 text-center">
      <p className="text-sm font-medium">
        {hasActiveFilters ? "No tasks match your filters" : "No tasks yet"}
      </p>
      <p className="text-xs text-muted-foreground">
        {hasActiveFilters
          ? "Try adjusting your search or filters."
          : "Create your first task to get started."}
      </p>
    </div>
  )
}
