import type { AppEventMap } from "@ops/shared-core"
import { Badge } from "@ops/ui/components/badge"
import { cn } from "@ops/ui/lib/utils"

const EVENT_TYPES: (keyof AppEventMap)[] = ["task:added", "task:completed", "task:removed"]

interface FilterBarProps {
  activeTypes: Set<keyof AppEventMap>
  onToggle: (type: keyof AppEventMap) => void
}

export function FilterBar({ activeTypes, onToggle }: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-1">
      {EVENT_TYPES.map((type) => (
        <Badge
          key={type}
          role="button"
          tabIndex={0}
          onClick={() => onToggle(type)}
          onKeyDown={(e) => e.key === "Enter" && onToggle(type)}
          variant={activeTypes.has(type) ? "default" : "outline"}
          className={cn("cursor-pointer rounded-full text-[10px]", activeTypes.has(type) && "bg-primary")}
        >
          {type}
        </Badge>
      ))}
    </div>
  )
}
