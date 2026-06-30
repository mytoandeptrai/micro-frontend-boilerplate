import { Button } from "@ops/ui/components/button"
import { TrashIcon } from "@phosphor-icons/react"

interface EventDebuggerHeaderProps {
  totalCount: number
  filteredCount: number
  onClear: () => void
}

export function EventDebuggerHeader({ totalCount, filteredCount, onClear }: EventDebuggerHeaderProps) {
  const showing = filteredCount < totalCount ? `${filteredCount}/${totalCount}` : String(totalCount)
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-semibold text-sm">Event Bus</p>
        <p className="text-muted-foreground text-xs">{showing} events</p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onClear}
        title="Clear logs"
      >
        <TrashIcon className="size-4" />
      </Button>
    </div>
  )
}
