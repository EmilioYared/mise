import { defineConfig } from "vitest/config";

// Security rules tests run against the Firestore emulator, one file at a time.
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/rules/**/*.test.ts"],
    fileParallelism: false,
    testTimeout: 15000,
  },
});
