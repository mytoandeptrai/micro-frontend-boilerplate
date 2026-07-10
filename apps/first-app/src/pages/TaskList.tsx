import type { Task } from "@ops/shared-core"
import { publishEvent } from "@ops/shared-core"
import { Button } from "@ops/ui/components/button"
import { Checkbox } from "@ops/ui/components/checkbox"
import { Input } from "@ops/ui/components/input"
import { useQueryState } from "nuqs"
import { type FormEvent, useState } from "react"
import { useStore } from "shell/store"

const SOURCE_INSTANCE_ID = "first-app"

type Filter = "all" | "active" | "completed"

export default function TaskList() {
  const user = useStore.use.user()
  const [tasks, setTasks] = useState<Task[]>([])
  const [title, setTitle] = useState("")
  const [filter, setFilter] = useQueryState<Filter>("filter", {
    defaultValue: "all",
    parse: (value) => (value === "active" || value === "completed" ? value : "all"),
  })

  function handleAdd(e: FormEvent) {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return

    const task: Task = {
      id: crypto.randomUUID(),
      title: trimmed,
      completed: false,
      createdAt: new Date(),
    }
    setTasks((prev) => [...prev, task])
    publishEvent("task:added", { task, sourceInstanceId: SOURCE_INSTANCE_ID })
    setTitle("")
  }

  function handleToggle(taskId: string) {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return
    const completed = !task.completed
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, completed } : t)))
    publishEvent("task:completed", { taskId, completed, sourceInstanceId: SOURCE_INSTANCE_ID })
  }

  function handleRemove(taskId: string) {
    setTasks((prev) => prev.filter((t) => t.id !== taskId))
    publishEvent("task:removed", { taskId, sourceInstanceId: SOURCE_INSTANCE_ID })
  }

  const filteredTasks = tasks.filter((t) => {
    if (filter === "active") return !t.completed
    if (filter === "completed") return t.completed
    return true
  })

  return (
    <div className="mx-auto max-w-lg p-6">
      <h1 className="text-2xl font-bold">Tasks{user ? ` — ${user.name}` : ""}</h1>

      <form onSubmit={handleAdd} className="mt-4 flex gap-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task"
        />
        <Button type="submit">Add</Button>
      </form>

      <div className="mt-4 flex gap-2">
        {(["all", "active", "completed"] as const).map((f) => (
          <Button
            key={f}
            type="button"
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
          >
            {f}
          </Button>
        ))}
      </div>

      <ul className="mt-4 flex flex-col gap-2">
        {filteredTasks.map((task) => (
          <li key={task.id} className="flex items-center gap-2 border-b border-border py-2">
            <Checkbox
              checked={task.completed}
              onCheckedChange={() => handleToggle(task.id)}
              aria-label={task.completed ? `Mark "${task.title}" as not done` : `Mark "${task.title}" as done`}
            />
            <span className={task.completed ? "flex-1 line-through text-muted-foreground" : "flex-1"}>
              {task.title}
            </span>
            <Button type="button" variant="ghost" size="sm" onClick={() => handleRemove(task.id)}>
              Delete
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}
