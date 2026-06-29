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
          paths: {
            "@ops/shared/*": ["../../packages/shared/src/*"],
            "@ops/ui/*": ["../../packages/ui/src/*"],
          },
        },
      },
    ],
  },
  moduleNameMapper: {
    "\\.(css|scss)$": "<rootDir>/src/__mocks__/fileMock.ts",
    "^@ops/shared/store$": "<rootDir>/src/__mocks__/sharedStore.ts",
    "^@ops/shared/(.*)$": "<rootDir>/../../packages/shared/src/$1",
    "^@ops/ui/(.*)$": "<rootDir>/../../packages/ui/src/$1",
    "^shell/store$": "<rootDir>/src/__mocks__/shellStore.ts",
  },
  moduleDirectories: ["node_modules", "<rootDir>/node_modules"],
  setupFilesAfterEnv: ["@testing-library/jest-dom"],
  testMatch: ["**/*.test.tsx", "**/*.test.ts"],
}

export default config
