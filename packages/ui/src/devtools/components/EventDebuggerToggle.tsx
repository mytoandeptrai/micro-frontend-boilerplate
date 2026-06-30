import { Badge } from "@ops/ui/components/badge"
import { Button } from "@ops/ui/components/button"
import { cn } from "@ops/ui/lib/utils"
import { BugIcon } from "@phosphor-icons/react"

interface EventDebuggerToggleProps {
  eventCount: number
  onExpand: () => void
  className?: string
}

export function EventDebuggerToggle({ eventCount, onExpand, className }: EventDebuggerToggleProps) {
  return (
    <Button
      type="button"
      variant="default"
      size="sm"
      onClick={onExpand}
      className={cn("fixed bottom-4 right-4 z-[9999] gap-1.5 rounded-full shadow-lg", className)}
    >
      <BugIcon className="size-3.5" />
      <span>Events</span>
      {eventCount > 0 && (
        <Badge variant="secondary" className="ml-0.5 h-4 rounded-full px-1.5 text-[10px]">
          {eventCount}
        </Badge>
      )}
    </Button>
  )
}
