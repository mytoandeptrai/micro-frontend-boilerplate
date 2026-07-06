import type { Task } from "../types"

export interface AppEventMap {
  "task:added": { task: Task; sourceInstanceId: string }
  "task:completed": { taskId: string; completed: boolean; sourceInstanceId: string }
  "task:removed": { taskId: string; sourceInstanceId: string }
}

export const publishEvent = <K extends keyof AppEventMap>(
  event: K,
  detail: AppEventMap[K],
): void => {
  window.dispatchEvent(new CustomEvent(event, { detail, bubbles: true, composed: true }))
}

export const subscribeEvent = <K extends keyof AppEventMap>(
  event: K,
  callback: (detail: AppEventMap[K]) => void,
): (() => void) => {
  const handler = (e: Event) => callback((e as CustomEvent<AppEventMap[K]>).detail)
  window.addEventListener(event, handler)
  return () => window.removeEventListener(event, handler)
}
