export interface AppEventMap {
  "member:added": { memberId: string; sourceInstanceId: string }
  "member:removed": { memberId: string; sourceInstanceId: string }
  "theme:change": { theme: "light" | "dark" }
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
