import { type AppEventMap, subscribeEvent } from "@ops/shared-core"
import { useCallback, useEffect, useState } from "react"
import { Sheet, SheetContent, SheetHeader } from "../components/sheet"
import { EventDebuggerHeader } from "./components/EventDebuggerHeader"
import { EventDebuggerToggle } from "./components/EventDebuggerToggle"
import { EventList } from "./components/EventList"
import { FilterBar } from "./components/FilterBar"
import { SearchBar } from "./components/SearchBar"
import { type EventLog, useEventFilters } from "./hooks/useEventFilters"

const EVENT_TYPES: (keyof AppEventMap)[] = ["task:added", "task:completed", "task:removed"]
const MAX_LOGS = 100

export function EventDebugger() {
  const [open, setOpen] = useState(false)
  const [logs, setLogs] = useState<EventLog[]>([])

  useEffect(() => {
    const unsubscribers = EVENT_TYPES.map((eventName) =>
      subscribeEvent(eventName, (payload) => {
        setLogs((prev) => {
          const log: EventLog = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            timestamp: new Date(),
            eventName,
            payload,
          }
          return [log, ...prev].slice(0, MAX_LOGS)
        })
      }),
    )
    return () => {
      for (const unsub of unsubscribers) unsub()
    }
  }, [])

  const clearLogs = useCallback(() => setLogs([]), [])

  const { searchTerm, setSearchTerm, activeTypes, toggleType, filteredLogs, clearSearch } =
    useEventFilters(logs)

  const hasFilters = searchTerm.length > 0 || activeTypes.size > 0

  return (
    <>
      <EventDebuggerToggle eventCount={logs.length} onExpand={() => setOpen(true)} />
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="flex w-full flex-col gap-3 sm:max-w-md">
          <SheetHeader>
            <EventDebuggerHeader
              totalCount={logs.length}
              filteredCount={filteredLogs.length}
              onClear={clearLogs}
            />
          </SheetHeader>
          <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} onClear={clearSearch} />
          <FilterBar activeTypes={activeTypes} onToggle={toggleType} />
          <EventList logs={filteredLogs} hasFilters={hasFilters} />
        </SheetContent>
      </Sheet>
    </>
  )
}
