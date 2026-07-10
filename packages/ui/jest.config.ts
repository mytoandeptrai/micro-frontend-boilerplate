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
            "@ops/shared-core": ["../shared-core/src/index.ts"],
            "@ops/ui/*": ["./src/*"],
          },
        },
      },
    ],
  },
  moduleNameMapper: {
    "\\.(css|scss)$": "<rootDir>/src/__mocks__/fileMock.ts",
    "^@ops/shared-core$": "<rootDir>/../shared-core/src/index.ts",
    "^@ops/ui/(.*)$": "<rootDir>/src/$1",
  },
  moduleDirectories: ["node_modules", "<rootDir>/node_modules"],
  setupFilesAfterEnv: ["@testing-library/jest-dom", "<rootDir>/src/jest-axe.setup.ts"],
  testMatch: ["**/*.test.tsx", "**/*.test.ts"],
}

export default config
