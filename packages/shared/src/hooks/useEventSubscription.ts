import { useEffect, useRef } from "react"
import { type AppEventMap, subscribeEvent } from "../event-bus"

export function useEventSubscription<K extends keyof AppEventMap>(
  event: K,
  callback: (detail: AppEventMap[K]) => void,
) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    return subscribeEvent(event, (detail) => callbackRef.current(detail))
  }, [event])
}
