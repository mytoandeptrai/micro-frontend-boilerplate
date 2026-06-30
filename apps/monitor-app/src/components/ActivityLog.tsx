import { Badge } from "@ops/ui/components/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@ops/ui/components/card"
import { ScrollArea } from "@ops/ui/components/scroll-area"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { ActivityItem, ActivityMeta } from "../hooks/useActivity"

const EVENT_VARIANT: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
  CREATED: "default",
  UPDATED: "secondary",
  DELETED: "destructive",
}

interface ActivityLogProps {
  items: ActivityItem[]
  meta: ActivityMeta
  page: number
  onPageChange: (page: number) => void
  isLoading?: boolean
}

function formatRelative(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export function ActivityLog({ items, meta, page, onPageChange, isLoading }: ActivityLogProps) {
  return (
    <Card className="rounded-xl border shadow-sm flex flex-col">
      <CardHeader className="border-b pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">Activity Log</CardTitle>
          {meta.total > 0 && (
            <span className="text-xs text-muted-foreground">{meta.total} events</span>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {["a", "b", "c", "d", "e"].map((k) => (
              <div key={k} className="flex items-center gap-3">
                <div className="h-5 w-16 animate-pulse rounded bg-muted" />
                <div className="h-4 flex-1 animate-pulse rounded bg-muted" />
                <div className="h-4 w-10 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            No activity yet.
          </div>
        ) : (
          <ScrollArea className="h-72">
            <ul className="divide-y">
              {items.map((item) => (
                <li key={item.id} className="flex items-center gap-3 px-4 py-2.5">
                  <Badge variant={EVENT_VARIANT[item.eventType] ?? "outline"} className="shrink-0 text-[10px]">
                    {item.eventType}
                  </Badge>
                  <span className="flex-1 truncate text-sm">
                    <span className="font-medium">{item.actorName}</span>
                    {item.targetName && item.targetName !== item.actorName && (
                      <span className="text-muted-foreground"> → {item.targetName}</span>
                    )}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatRelative(item.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </CardContent>

      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between border-t px-4 py-2">
          <span className="text-xs text-muted-foreground">
            Page {meta.page} of {meta.totalPages}
          </span>
          <div className="flex gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="inline-flex h-7 w-7 items-center justify-center rounded border text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40"
            >
              <ChevronLeft className="size-3.5" />
            </button>
            <button
              type="button"
              disabled={page >= meta.totalPages}
              onClick={() => onPageChange(page + 1)}
              className="inline-flex h-7 w-7 items-center justify-center rounded border text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40"
            >
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
      )}
    </Card>
  )
}
