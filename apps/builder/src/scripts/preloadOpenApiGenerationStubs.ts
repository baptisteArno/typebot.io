import { readFileSync } from "node:fs";
import { plugin } from "bun";

// OpenAPI generation only traverses contracts and never runs handlers, so
// runtime-only dependencies can be stubbed:
// - isolated-vm is a Node-only native addon that can't load under Bun.
// - The Prisma client is instantiated at import time and requires a
//   DATABASE_URL whose protocol matches the generated client's provider.

plugin({
  name: "isolated-vm-stub",
  setup(build) {
    build.module("isolated-vm", () => ({
      exports: {
        default: {},
        Isolate: class {},
        Context: class {},
        Reference: class {},
      },
      loader: "object",
    }));
  },
});

process.env.DATABASE_URL = readFileSync(
  new URL(
    "../../../../node_modules/.prisma/client/schema.prisma",
    import.meta.url,
  ),
  "utf-8",
).match(/provider\s*=\s*"mysql"/)
  ? "mysql://user:password@localhost:3306/typebot"
  : "postgresql://user:password@localhost:5432/typebot";
