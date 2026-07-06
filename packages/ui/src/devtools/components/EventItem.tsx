import { Badge } from "@ops/ui/components/badge"
import { Button } from "@ops/ui/components/button"
import { CaretDownIcon, CaretRightIcon } from "@phosphor-icons/react"
import { useState } from "react"
import type { EventLog } from "../hooks/useEventFilters"

const BADGE_VARIANTS: Record<string, "default" | "destructive" | "outline"> = {
  "task:added": "default",
  "task:removed": "destructive",
}

interface EventItemProps {
  log: EventLog
}

export function EventItem({ log }: EventItemProps) {
  const [open, setOpen] = useState(false)
  const badgeVariant = BADGE_VARIANTS[log.eventName] ?? "outline"

  return (
    <div className="border-border border-b py-1.5 last:border-0">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setOpen((v) => !v)}
        className="h-auto w-full justify-start gap-2 px-0 py-0 font-normal"
      >
        {open ? (
          <CaretDownIcon className="text-muted-foreground size-3 shrink-0" />
        ) : (
          <CaretRightIcon className="text-muted-foreground size-3 shrink-0" />
        )}
        <span className="text-muted-foreground shrink-0 font-mono text-[10px]">
          {log.timestamp.toLocaleTimeString()}
        </span>
        <Badge variant={badgeVariant} className="rounded-full text-[10px]">
          {log.eventName}
        </Badge>
      </Button>
      {open && (
        <pre className="bg-muted mt-1 overflow-auto rounded p-2 text-[10px] leading-relaxed">
          {JSON.stringify(log.payload, null, 2)}
        </pre>
      )}
    </div>
  )
}
