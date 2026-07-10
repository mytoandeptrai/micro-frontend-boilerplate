import type { Config } from "jest"

const config: Config = {
  projects: [
    "<rootDir>/apps/shell",
    "<rootDir>/apps/base-app",
    "<rootDir>/apps/first-app",
    "<rootDir>/apps/second-app",
    "<rootDir>/packages/ui",
  ],
}

export default config
