import type { Config } from "jest";

const config: Config = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: { jsx: "react-jsx", types: ["jest", "@testing-library/jest-dom"] } }],
  },
  moduleNameMapper: {
    "^@ops/ui/(.*)$": "<rootDir>/packages/ui/src/$1",
    "\\.(css|less|scss|sass)$": "<rootDir>/jest.style-mock.js",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testMatch: ["**/*.test.ts", "**/*.test.tsx"],
  testPathIgnorePatterns: ["/node_modules/", "/e2e/"],
};

export default config;
