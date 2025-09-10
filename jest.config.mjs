import { createDefaultPreset } from "ts-jest";

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
export default {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  testMatch: [
    "**/tests/**/*.test.ts",
    "**/tests/**/*.spec.ts"
  ],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/**/index.ts"
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/"
  ],
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
  setupFiles: ["<rootDir>/tests/env.setup.js"],
  clearMocks: true
};