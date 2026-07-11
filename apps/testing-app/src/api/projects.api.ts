import type { Project } from "../types/task"
import { getProjectsFromDb } from "./db"
import { ApiError, DELAY_MS, delay } from "./delay"
import { consumeScenario } from "./scenario"

export async function getProjects(): Promise<Project[]> {
  const scenario = consumeScenario("projects.getProjects")
  await delay(scenario === "slow" ? DELAY_MS.slow : DELAY_MS.fast)
  if (scenario === "error") throw new ApiError(500, "Failed to load projects")
  if (scenario === "empty") return []
  return getProjectsFromDb()
}
