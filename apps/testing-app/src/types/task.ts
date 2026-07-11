export type TaskStatus = "todo" | "in-progress" | "completed"
export type TaskPriority = "low" | "medium" | "high"

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  projectId: string | null
  tagIds: string[]
  deadline: string | null
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: string
  name: string
}

export interface Tag {
  id: string
  name: string
}

export interface User {
  id: string
  name: string
  email: string
}

export interface CreateTaskInput {
  title: string
  description?: string
  priority: TaskPriority
  projectId: string | null
  tagIds?: string[]
  deadline?: string | null
}

export interface UpdateTaskInput {
  title?: string
  description?: string
  priority?: TaskPriority
  projectId?: string | null
  tagIds?: string[]
  deadline?: string | null
}

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  name: string
  email: string
  password: string
}
