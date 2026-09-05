import { defineProject } from "vitest/config";

export default defineProject({
  test: {
    name: "@typebot.io/webhook-block",
    root: __dirname,
    watch: false,
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
