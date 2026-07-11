/**
 * In-memory network scenario simulator.
 *
 * Lets you deliberately trigger success / error / empty / slow / notFound /
 * validationError / flakyOnce behavior per fake-API endpoint, without a real
 * backend. Intended for manual QA — call `window.__scenario.set(...)` from
 * the browser console, or import `setScenario` directly.
 *
 * "flakyOnce" fails exactly once, then reverts to "success" — useful for
 * manually exercising retry / "retry succeeds" UI paths.
 */

export type NetworkScenario =
  | "success"
  | "error"
  | "notFound"
  | "empty"
  | "slow"
  | "validationError"
  | "flakyOnce"

export type ScenarioKey =
  | "tasks.getTasks"
  | "tasks.getTask"
  | "tasks.createTask"
  | "tasks.updateTask"
  | "tasks.updateTaskStatus"
  | "tasks.deleteTask"
  | "projects.getProjects"
  | "tags.getTags"
  | "auth.login"
  | "auth.register"
  | "auth.getCurrentUser"

const scenarios = new Map<ScenarioKey, NetworkScenario>()
const flakyConsumed = new Set<ScenarioKey>()

export function setScenario(key: ScenarioKey, scenario: NetworkScenario): void {
  scenarios.set(key, scenario)
  flakyConsumed.delete(key)
}

export function clearScenario(key: ScenarioKey): void {
  scenarios.delete(key)
  flakyConsumed.delete(key)
}

export function clearAllScenarios(): void {
  scenarios.clear()
  flakyConsumed.clear()
}

export function consumeScenario(key: ScenarioKey): NetworkScenario {
  const scenario = scenarios.get(key) ?? "success"
  if (scenario !== "flakyOnce") return scenario

  if (flakyConsumed.has(key)) {
    scenarios.set(key, "success")
    flakyConsumed.delete(key)
    return "success"
  }

  flakyConsumed.add(key)
  return "error"
}

declare global {
  interface Window {
    __scenario?: {
      set: typeof setScenario
      clear: typeof clearScenario
      clearAll: typeof clearAllScenarios
    }
  }
}

if (typeof window !== "undefined") {
  window.__scenario = {
    set: setScenario,
    clear: clearScenario,
    clearAll: clearAllScenarios,
  }
}
