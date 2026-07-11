import { isBeforeDay } from "./date"
import type { Task, TaskPriority, TaskStatus } from "../types/task"

export const TASK_TITLE_MAX_LENGTH = 100
export const TASK_DESCRIPTION_MAX_LENGTH = 1000
export const PASSWORD_MIN_LENGTH = 6

export interface ValidationResult {
  valid: boolean
  error?: string
}

export function validateTaskTitle(title: string): ValidationResult {
  const trimmed = title.trim()
  if (!trimmed) return { valid: false, error: "Title is required" }
  if (trimmed.length > TASK_TITLE_MAX_LENGTH) {
    return {
      valid: false,
      error: `Title must be at most ${TASK_TITLE_MAX_LENGTH} characters`,
    }
  }
  return { valid: true }
}

export function validateTaskDescription(description: string): ValidationResult {
  if (description.length > TASK_DESCRIPTION_MAX_LENGTH) {
    return {
      valid: false,
      error: `Description must be at most ${TASK_DESCRIPTION_MAX_LENGTH} characters`,
    }
  }
  return { valid: true }
}

export function validateDeadlineNotInPast(
  deadline: string | null,
  referenceDate: Date = new Date(),
): ValidationResult {
  if (!deadline) return { valid: true }
  if (isBeforeDay(deadline, referenceDate)) {
    return { valid: false, error: "Deadline cannot be earlier than today" }
  }
  return { valid: true }
}

export function validateHighPriorityHasDeadline(
  priority: TaskPriority,
  deadline: string | null,
): ValidationResult {
  if (priority === "high" && !deadline) {
    return { valid: false, error: "High priority tasks must have a deadline" }
  }
  return { valid: true }
}

export function isDuplicateTitleInProject(
  tasks: Task[],
  title: string,
  projectId: string | null,
  excludeTaskId?: string,
): boolean {
  const normalized = title.trim().toLowerCase()
  return tasks.some(
    (task) =>
      task.id !== excludeTaskId &&
      task.projectId === projectId &&
      task.title.trim().toLowerCase() === normalized,
  )
}

/**
 * A completed task cannot jump straight back to in-progress — it must pass
 * through todo first. Every other transition (including no-ops) is allowed.
 */
export function canTransitionStatus(from: TaskStatus, to: TaskStatus): boolean {
  if (from === to) return true
  if (from === "completed" && to === "in-progress") return false
  return true
}

export function validateEmail(email: string): ValidationResult {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!pattern.test(email)) return { valid: false, error: "Enter a valid email address" }
  return { valid: true }
}

export function validatePassword(password: string): ValidationResult {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return {
      valid: false,
      error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
    }
  }
  return { valid: true }
}
