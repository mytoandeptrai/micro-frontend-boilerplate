import type { Project, Tag, Task, User } from "../types/task"

const STORAGE_KEY = "testing-app:db:v1"

export interface StoredAuthUser extends User {
  password: string
}

interface DbShape {
  tasks: Task[]
  projects: Project[]
  tags: Tag[]
  users: StoredAuthUser[]
  sessionUserId: string | null
}

function isBrowser(): boolean {
  return typeof window !== "undefined"
}

function nowIso(): string {
  return new Date().toISOString()
}

export function createId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

function seedDb(): DbShape {
  const personalProjectId = createId("project")
  const workProjectId = createId("project")

  const urgentTagId = createId("tag")
  const bugTagId = createId("tag")
  const featureTagId = createId("tag")

  const createdAt = nowIso()
  const inThreeDays = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()

  return {
    projects: [
      { id: personalProjectId, name: "Personal" },
      { id: workProjectId, name: "Work" },
    ],
    tags: [
      { id: urgentTagId, name: "urgent" },
      { id: bugTagId, name: "bug" },
      { id: featureTagId, name: "feature" },
    ],
    users: [
      {
        id: createId("user"),
        name: "Demo User",
        email: "demo@test.com",
        password: "demo1234",
      },
    ],
    tasks: [
      {
        id: createId("task"),
        title: "Plan weekly grocery shopping",
        description: "Write down what's needed for the week.",
        status: "todo",
        priority: "low",
        projectId: personalProjectId,
        tagIds: [],
        deadline: null,
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: createId("task"),
        title: "Fix login page crash",
        description: "Reported by QA, happens on Safari only.",
        status: "in-progress",
        priority: "high",
        projectId: workProjectId,
        tagIds: [bugTagId, urgentTagId],
        deadline: inThreeDays,
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: createId("task"),
        title: "Ship dark mode toggle",
        description: "Design already approved.",
        status: "completed",
        priority: "medium",
        projectId: workProjectId,
        tagIds: [featureTagId],
        deadline: null,
        createdAt,
        updatedAt: createdAt,
      },
    ],
    sessionUserId: null,
  }
}

function persistToLocalStorage(next: DbShape): void {
  if (!isBrowser()) return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}

function loadDb(): DbShape {
  if (!isBrowser()) return seedDb()

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    const seeded = seedDb()
    persistToLocalStorage(seeded)
    return seeded
  }

  try {
    return JSON.parse(raw) as DbShape
  } catch {
    const seeded = seedDb()
    persistToLocalStorage(seeded)
    return seeded
  }
}

let db: DbShape = loadDb()

function saveDb(next: DbShape): void {
  db = next
  persistToLocalStorage(next)
}

export function getTasksFromDb(): Task[] {
  return db.tasks
}

export function getTaskFromDb(id: string): Task | undefined {
  return db.tasks.find((task) => task.id === id)
}

export function insertTaskInDb(task: Task): void {
  saveDb({ ...db, tasks: [task, ...db.tasks] })
}

export function replaceTaskInDb(task: Task): void {
  saveDb({
    ...db,
    tasks: db.tasks.map((existing) => (existing.id === task.id ? task : existing)),
  })
}

export function removeTaskFromDb(id: string): void {
  saveDb({ ...db, tasks: db.tasks.filter((task) => task.id !== id) })
}

export function getProjectsFromDb(): Project[] {
  return db.projects
}

export function getTagsFromDb(): Tag[] {
  return db.tags
}

export function findUserByEmail(email: string): StoredAuthUser | undefined {
  return db.users.find((user) => user.email.toLowerCase() === email.toLowerCase())
}

export function findUserById(id: string): StoredAuthUser | undefined {
  return db.users.find((user) => user.id === id)
}

export function insertUserInDb(user: StoredAuthUser): void {
  saveDb({ ...db, users: [...db.users, user] })
}

export function setSessionUserId(userId: string | null): void {
  saveDb({ ...db, sessionUserId: userId })
}

export function getSessionUserId(): string | null {
  return db.sessionUserId
}

export function resetDb(): void {
  saveDb(seedDb())
}

declare global {
  interface Window {
    __resetDb?: () => void
  }
}

if (isBrowser()) {
  window.__resetDb = resetDb
}
