import type { Tag } from "../types/task"
import { getTagsFromDb } from "./db"
import { ApiError, DELAY_MS, delay } from "./delay"
import { consumeScenario } from "./scenario"

export async function getTags(): Promise<Tag[]> {
  const scenario = consumeScenario("tags.getTags")
  await delay(scenario === "slow" ? DELAY_MS.slow : DELAY_MS.fast)
  if (scenario === "error") throw new ApiError(500, "Failed to load tags")
  if (scenario === "empty") return []
  return getTagsFromDb()
}
