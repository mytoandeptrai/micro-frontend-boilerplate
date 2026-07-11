import { createContext, useContext, useMemo, useState, type ReactNode } from "react"

import type { TaskPriority } from "../types/task"

export type TaskViewMode = "list" | "table"
export type DateFormatPattern = "short" | "long"

export interface DefaultTaskConfig {
  priority: TaskPriority
  projectId: string | null
}

export interface TaskPermissions {
  canCreateTask: boolean
  canEditTask: boolean
  canDeleteTask: boolean
}

export interface TaskConfigContextValue {
  viewMode: TaskViewMode
  setViewMode: (mode: TaskViewMode) => void
  dateFormat: DateFormatPattern
  setDateFormat: (pattern: DateFormatPattern) => void
  defaultTaskConfig: DefaultTaskConfig
  permissions: TaskPermissions
}

const DEFAULT_TASK_CONFIG: DefaultTaskConfig = {
  priority: "medium",
  projectId: null,
}

const DEFAULT_PERMISSIONS: TaskPermissions = {
  canCreateTask: true,
  canEditTask: true,
  canDeleteTask: true,
}

const TaskConfigContext = createContext<TaskConfigContextValue | null>(null)

export interface TaskConfigProviderProps {
  children: ReactNode
  defaultTaskConfig?: Partial<DefaultTaskConfig>
  permissions?: Partial<TaskPermissions>
}

export function TaskConfigProvider({
  children,
  defaultTaskConfig,
  permissions,
}: TaskConfigProviderProps) {
  const [viewMode, setViewMode] = useState<TaskViewMode>("list")
  const [dateFormat, setDateFormat] = useState<DateFormatPattern>("short")

  const value = useMemo<TaskConfigContextValue>(
    () => ({
      viewMode,
      setViewMode,
      dateFormat,
      setDateFormat,
      defaultTaskConfig: { ...DEFAULT_TASK_CONFIG, ...defaultTaskConfig },
      permissions: { ...DEFAULT_PERMISSIONS, ...permissions },
    }),
    [viewMode, dateFormat, defaultTaskConfig, permissions],
  )

  return <TaskConfigContext.Provider value={value}>{children}</TaskConfigContext.Provider>
}

export function useTaskConfig(): TaskConfigContextValue {
  const context = useContext(TaskConfigContext)
  if (!context) {
    throw new Error("useTaskConfig must be used within a TaskConfigProvider")
  }
  return context
}
