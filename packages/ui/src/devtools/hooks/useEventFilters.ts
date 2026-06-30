import { useMemo, useState } from "react"
import type { AppEventMap } from "@ops/shared"

export interface EventLog {
  id: string
  timestamp: Date
  eventName: keyof AppEventMap
  payload: unknown
}

export function useEventFilters(logs: EventLog[]) {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTypes, setActiveTypes] = useState<Set<keyof AppEventMap>>(new Set())

  const filteredLogs = useMemo(() => {
    let result = [...logs]

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (log) =>
          log.eventName.toLowerCase().includes(term) ||
          JSON.stringify(log.payload).toLowerCase().includes(term),
      )
    }

    if (activeTypes.size > 0) {
      result = result.filter((log) => activeTypes.has(log.eventName))
    }

    return result
  }, [logs, searchTerm, activeTypes])

  const toggleType = (type: keyof AppEventMap) => {
    setActiveTypes((prev) => {
      const next = new Set(prev)
      next.has(type) ? next.delete(type) : next.add(type)
      return next
    })
  }

  return {
    searchTerm,
    setSearchTerm,
    activeTypes,
    toggleType,
    filteredLogs,
    clearSearch: () => setSearchTerm(""),
    clearFilters: () => setActiveTypes(new Set()),
  }
}
