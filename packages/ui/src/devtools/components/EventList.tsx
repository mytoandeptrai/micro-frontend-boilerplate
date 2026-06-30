import { ScrollArea } from "@ops/ui/components/scroll-area"
import type { EventLog } from "../hooks/useEventFilters"
import { EmptyState } from "./EmptyState"
import { EventItem } from "./EventItem"

interface EventListProps {
  logs: EventLog[]
  hasFilters: boolean
}

export function EventList({ logs, hasFilters }: EventListProps) {
  if (logs.length === 0) return <EmptyState hasFilters={hasFilters} />
  return (
    <ScrollArea className="flex-1">
      {logs.map((log) => (
        <EventItem key={log.id} log={log} />
      ))}
    </ScrollArea>
  )
}
