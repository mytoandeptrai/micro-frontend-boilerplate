import { Button } from "@ops/ui/components/button"

import { useUndoDelete } from "../../hooks/useUndoDelete"

export default function UndoDeleteNotification() {
  const { pendingDeletions, undoDelete } = useUndoDelete()

  if (pendingDeletions.length === 0) return null

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2">
      {pendingDeletions.map((entry) => (
        <div
          key={entry.taskId}
          role="status"
          className="flex items-center gap-3 rounded-none bg-foreground px-4 py-2 text-background shadow-lg"
        >
          <span className="text-xs">&ldquo;{entry.taskTitle}&rdquo; deleted</span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => undoDelete(entry.taskId)}
          >
            Undo
          </Button>
        </div>
      ))}
    </div>
  )
}
