import {
  canTransitionStatus,
  isDuplicateTitleInProject,
  validateDeadlineNotInPast,
  validateHighPriorityHasDeadline,
  validateTaskDescription,
  validateTaskTitle,
} from "../lib/businessRules"
import type { CreateTaskInput, Task, TaskStatus, UpdateTaskInput } from "../types/task"
import {
  createId,
  getTaskFromDb,
  getTasksFromDb,
  insertTaskInDb,
  removeTaskFromDb,
  replaceTaskInDb,
} from "./db"
import { ApiError, DELAY_MS, delay } from "./delay"
import { consumeScenario, type NetworkScenario } from "./scenario"

function nowIso(): string {
  return new Date().toISOString()
}

function resolveDelay(scenario: NetworkScenario): Promise<void> {
  return delay(scenario === "slow" ? DELAY_MS.slow : DELAY_MS.normal)
}

export async function getTasks(): Promise<Task[]> {
  const scenario = consumeScenario("tasks.getTasks")
  await resolveDelay(scenario)
  if (scenario === "error") throw new ApiError(500, "Failed to load tasks")
  if (scenario === "empty") return []
  return getTasksFromDb()
}

export async function getTask(id: string): Promise<Task> {
  const scenario = consumeScenario("tasks.getTask")
  await resolveDelay(scenario)
  if (scenario === "error") throw new ApiError(500, "Failed to load task")
  if (scenario === "notFound") throw new ApiError(404, "Task not found")

  const task = getTaskFromDb(id)
  if (!task) throw new ApiError(404, "Task not found")
  return task
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const scenario = consumeScenario("tasks.createTask")
  await resolveDelay(scenario)
  if (scenario === "error") throw new ApiError(500, "Failed to create task")
  if (scenario === "validationError") throw new ApiError(422, "Simulated validation error")

  const titleCheck = validateTaskTitle(input.title)
  if (!titleCheck.valid) throw new ApiError(422, titleCheck.error ?? "Invalid title")

  const descriptionCheck = validateTaskDescription(input.description ?? "")
  if (!descriptionCheck.valid) {
    throw new ApiError(422, descriptionCheck.error ?? "Invalid description")
  }

  const deadlineCheck = validateDeadlineNotInPast(input.deadline ?? null)
  if (!deadlineCheck.valid) throw new ApiError(422, deadlineCheck.error ?? "Invalid deadline")

  const priorityCheck = validateHighPriorityHasDeadline(input.priority, input.deadline ?? null)
  if (!priorityCheck.valid) throw new ApiError(422, priorityCheck.error ?? "Invalid priority")

  if (isDuplicateTitleInProject(getTasksFromDb(), input.title, input.projectId)) {
    throw new ApiError(409, "A task with this title already exists in this project")
  }

  const createdAt = nowIso()
  const task: Task = {
    id: createId("task"),
    title: input.title.trim(),
    description: (input.description ?? "").trim(),
    status: "todo",
    priority: input.priority,
    projectId: input.projectId,
    tagIds: input.tagIds ?? [],
    deadline: input.deadline ?? null,
    createdAt,
    updatedAt: createdAt,
  }
  insertTaskInDb(task)
  return task
}

export async function updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
  const scenario = consumeScenario("tasks.updateTask")
  await resolveDelay(scenario)
  if (scenario === "error") throw new ApiError(500, "Failed to update task")
  if (scenario === "notFound") throw new ApiError(404, "Task not found")
  if (scenario === "validationError") throw new ApiError(422, "Simulated validation error")

  const existing = getTaskFromDb(id)
  if (!existing) throw new ApiError(404, "Task not found")

  const nextTitle = input.title ?? existing.title
  const nextDescription = input.description ?? existing.description
  const nextPriority = input.priority ?? existing.priority
  const nextProjectId = input.projectId !== undefined ? input.projectId : existing.projectId
  const nextDeadline = input.deadline !== undefined ? input.deadline : existing.deadline

  const titleCheck = validateTaskTitle(nextTitle)
  if (!titleCheck.valid) throw new ApiError(422, titleCheck.error ?? "Invalid title")

  const descriptionCheck = validateTaskDescription(nextDescription)
  if (!descriptionCheck.valid) {
    throw new ApiError(422, descriptionCheck.error ?? "Invalid description")
  }

  const deadlineCheck = validateDeadlineNotInPast(nextDeadline)
  if (!deadlineCheck.valid) throw new ApiError(422, deadlineCheck.error ?? "Invalid deadline")

  const priorityCheck = validateHighPriorityHasDeadline(nextPriority, nextDeadline)
  if (!priorityCheck.valid) throw new ApiError(422, priorityCheck.error ?? "Invalid priority")

  if (isDuplicateTitleInProject(getTasksFromDb(), nextTitle, nextProjectId, id)) {
    throw new ApiError(409, "A task with this title already exists in this project")
  }

  const updated: Task = {
    ...existing,
    title: nextTitle.trim(),
    description: nextDescription.trim(),
    priority: nextPriority,
    projectId: nextProjectId,
    tagIds: input.tagIds ?? existing.tagIds,
    deadline: nextDeadline,
    updatedAt: nowIso(),
  }
  replaceTaskInDb(updated)
  return updated
}

export async function updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
  const scenario = consumeScenario("tasks.updateTaskStatus")
  await resolveDelay(scenario)
  if (scenario === "error") throw new ApiError(500, "Failed to update task status")
  if (scenario === "notFound") throw new ApiError(404, "Task not found")

  const existing = getTaskFromDb(id)
  if (!existing) throw new ApiError(404, "Task not found")

  if (!canTransitionStatus(existing.status, status)) {
    throw new ApiError(
      422,
      "A completed task must go back to todo before it can be in progress again",
    )
  }

  const updated: Task = { ...existing, status, updatedAt: nowIso() }
  replaceTaskInDb(updated)
  return updated
}

export async function deleteTask(id: string): Promise<void> {
  const scenario = consumeScenario("tasks.deleteTask")
  await resolveDelay(scenario)
  if (scenario === "error") throw new ApiError(500, "Failed to delete task")
  if (scenario === "notFound") throw new ApiError(404, "Task not found")

  const existing = getTaskFromDb(id)
  if (!existing) throw new ApiError(404, "Task not found")
  removeTaskFromDb(id)
}
