import { mock } from "bun:test";

process.env.SKIP_ENV_CHECK = "true";

mock.module("isolated-vm", () => ({
  default: {},
  Isolate: class {},
  Context: class {},
}));
