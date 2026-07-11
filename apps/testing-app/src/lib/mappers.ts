import type { CreateTaskInput, TaskPriority, UpdateTaskInput } from "../types/task"

export interface TaskFormValues {
  title: string
  description: string
  priority: TaskPriority
  projectId: string
  tagIds: string[]
  deadline: string
}

export function mapFormValuesToCreateTaskInput(values: TaskFormValues): CreateTaskInput {
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    priority: values.priority,
    projectId: values.projectId || null,
    tagIds: values.tagIds,
    deadline: values.deadline || null,
  }
}

export function mapFormValuesToUpdateTaskInput(values: TaskFormValues): UpdateTaskInput {
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    priority: values.priority,
    projectId: values.projectId || null,
    tagIds: values.tagIds,
    deadline: values.deadline || null,
  }
}
