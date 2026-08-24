import { mock } from "bun:test";

mock.module("isolated-vm", () => ({
  default: {},
  Isolate: class {},
  Context: class {},
}));
