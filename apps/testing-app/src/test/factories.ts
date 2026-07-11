import type { Project, Tag, Task, User } from "../types/task"

let taskSequence = 0
let projectSequence = 0
let tagSequence = 0
let userSequence = 0

export function createMockTask(overrides: Partial<Task> = {}): Task {
  taskSequence += 1
  const createdAt = new Date().toISOString()

  return {
    id: `task-${taskSequence}`,
    title: `Task ${taskSequence}`,
    description: "",
    status: "todo",
    priority: "medium",
    projectId: null,
    tagIds: [],
    deadline: null,
    createdAt,
    updatedAt: createdAt,
    ...overrides,
  }
}

export function createMockProject(overrides: Partial<Project> = {}): Project {
  projectSequence += 1

  return {
    id: `project-${projectSequence}`,
    name: `Project ${projectSequence}`,
    ...overrides,
  }
}

export function createMockTag(overrides: Partial<Tag> = {}): Tag {
  tagSequence += 1

  return {
    id: `tag-${tagSequence}`,
    name: `tag-${tagSequence}`,
    ...overrides,
  }
}

export function createMockUser(overrides: Partial<User> = {}): User {
  userSequence += 1

  return {
    id: `user-${userSequence}`,
    name: `User ${userSequence}`,
    email: `user${userSequence}@test.com`,
    ...overrides,
  }
}
