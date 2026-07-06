import type { Config } from "jest"

const config: Config = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(t|j)sx?$": [
      "ts-jest",
      {
        diagnostics: false,
        tsconfig: {
          jsx: "react-jsx",
          types: ["jest", "@testing-library/jest-dom"],
        },
      },
    ],
  },
  moduleNameMapper: {
    "\\.(css|scss)$": "<rootDir>/src/__mocks__/fileMock.ts",
    "^@ops/ui/(.*)$": "<rootDir>/../../packages/ui/src/$1",
  },
  transformIgnorePatterns: ["node_modules/(?!.*nuqs)"],
  moduleDirectories: ["node_modules", "<rootDir>/node_modules"],
  setupFilesAfterEnv: ["@testing-library/jest-dom"],
  testMatch: ["**/*.test.tsx", "**/*.test.ts"],
}

export default config
