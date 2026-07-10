import { useStore } from "@ops/shared-core"
import { Button } from "@ops/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@ops/ui/components/dialog"
import { Input } from "@ops/ui/components/input"
import { type FormEvent, useState } from "react"

export default function NameModal() {
  const user = useStore.use.user()
  const setUser = useStore.use.setUser()
  const [name, setName] = useState("")

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    setUser({ name: trimmed })
  }

  return (
    <Dialog open={user === null} onOpenChange={() => {}}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Welcome to Task Board</DialogTitle>
          <DialogDescription>Enter your name to get started.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
          <Button type="submit">Continue</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
