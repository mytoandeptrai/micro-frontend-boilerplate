import { useState, type ReactNode } from "react"

import { Button } from "@ops/ui/components/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@ops/ui/components/dialog"

import { useUndoDelete } from "../../hooks/useUndoDelete"
import type { Task } from "../../types/task"

interface TaskDeleteDialogProps {
  task: Task
  trigger: ReactNode
}

export default function TaskDeleteDialog({ task, trigger }: TaskDeleteDialogProps) {
  const [open, setOpen] = useState(false)
  const { requestDelete } = useUndoDelete()

  function handleConfirm() {
    requestDelete(task)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete task</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &ldquo;{task.title}&rdquo;? You can undo this for a few
            seconds after deleting.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" variant="destructive" onClick={handleConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
