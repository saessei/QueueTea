import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    test: {
      exclude: [
        "**/node_modules/**",
        "**/dist/**",
        "**/.{idea,git,cache,output,temp}/**",
        "**/*.spec.ts",
      ],
      environment: "jsdom",
      globals: true,
      setupFiles: [path.resolve(__dirname, "./src/tests/setup.ts")],
      env: env,
    },
  };
});
