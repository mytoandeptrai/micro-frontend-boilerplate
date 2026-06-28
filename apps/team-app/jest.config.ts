import type { Config } from "jest"

const config: Config = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(t|j)sx?$": [
      "ts-jest",
      {
        tsconfig: {
          jsx: "react-jsx",
          types: ["jest", "@testing-library/jest-dom"],
          paths: {
            "@ops/ui/*": ["../../packages/ui/src/*"],
            "@ops/shared-utils/*": ["../../packages/shared-utils/src/*"],
          },
        },
      },
    ],
  },
  moduleNameMapper: {
    "\\.(css|scss)$": "<rootDir>/src/__mocks__/fileMock.ts",
    "^@ops/ui/(.*)$": "<rootDir>/../../packages/ui/src/$1",
    "^@ops/shared-utils/(.*)$": "<rootDir>/../../packages/shared-utils/src/$1",
    "^nuqs$": "<rootDir>/src/__mocks__/nuqs.ts",
    "^nuqs/(.*)$": "<rootDir>/src/__mocks__/nuqs.ts",
  },
  setupFilesAfterEnv: ["@testing-library/jest-dom"],
  testMatch: ["**/*.test.tsx", "**/*.test.ts"],
}

export default config
