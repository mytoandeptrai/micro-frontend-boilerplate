import dataSource from "../data-source"
import { seedMembers } from "./member.seed"
import { seedStats } from "./stats.seed"

async function runSeed() {
  await dataSource.initialize()
  console.log("Data source initialized. Running seeds...")

  await seedMembers(dataSource)
  await seedStats(dataSource)

  console.log("Seeding complete.")
  await dataSource.destroy()
}

runSeed().catch((err) => {
  console.error("Seeding failed:", err)
  process.exit(1)
})
