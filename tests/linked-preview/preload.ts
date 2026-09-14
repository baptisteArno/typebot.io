import { mock } from "bun:test";

process.env.SKIP_ENV_CHECK = "true";
class UnavailableVM {
  constructor() {
    throw new Error("This fixture must not execute server-side user code");
  }
}
mock.module("isolated-vm", () => ({
  default: {},
  Isolate: UnavailableVM,
  Context: UnavailableVM,
  Reference: UnavailableVM,
  ExternalCopy: UnavailableVM,
}));
