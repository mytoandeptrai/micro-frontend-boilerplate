import { create } from "zustand"

export interface PendingDeletion {
  taskId: string
  taskTitle: string
}

interface TaskStoreState {
  selectedTaskId: string | null
  isDetailDrawerOpen: boolean
  pendingDeletions: PendingDeletion[]
}

interface TaskStoreActions {
  selectTask: (taskId: string | null) => void
  openTaskDetail: (taskId: string) => void
  closeTaskDetail: () => void
  addPendingDeletion: (entry: PendingDeletion) => void
  removePendingDeletion: (taskId: string) => void
  reset: () => void
}

export type TaskStore = TaskStoreState & TaskStoreActions

export const taskStoreInitialState: TaskStoreState = {
  selectedTaskId: null,
  isDetailDrawerOpen: false,
  pendingDeletions: [],
}

export const useTaskStore = create<TaskStore>((set) => ({
  ...taskStoreInitialState,

  selectTask: (taskId) => set({ selectedTaskId: taskId }),

  openTaskDetail: (taskId) => set({ selectedTaskId: taskId, isDetailDrawerOpen: true }),

  closeTaskDetail: () => set({ isDetailDrawerOpen: false }),

  addPendingDeletion: (entry) =>
    set((state) => ({ pendingDeletions: [...state.pendingDeletions, entry] })),

  removePendingDeletion: (taskId) =>
    set((state) => ({
      pendingDeletions: state.pendingDeletions.filter((entry) => entry.taskId !== taskId),
    })),

  reset: () => set(taskStoreInitialState),
}))

export const useSelectedTaskId = () => useTaskStore((state) => state.selectedTaskId)
export const useIsDetailDrawerOpen = () => useTaskStore((state) => state.isDetailDrawerOpen)
export const usePendingDeletions = () => useTaskStore((state) => state.pendingDeletions)

export function useIsTaskPendingDeletion(taskId: string): boolean {
  return useTaskStore((state) => state.pendingDeletions.some((entry) => entry.taskId === taskId))
}

export const useSelectTask = () => useTaskStore((state) => state.selectTask)
export const useOpenTaskDetail = () => useTaskStore((state) => state.openTaskDetail)
export const useCloseTaskDetail = () => useTaskStore((state) => state.closeTaskDetail)
export const useAddPendingDeletion = () => useTaskStore((state) => state.addPendingDeletion)
export const useRemovePendingDeletion = () => useTaskStore((state) => state.removePendingDeletion)
export const useResetTaskStore = () => useTaskStore((state) => state.reset)
