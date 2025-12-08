import { mock } from "bun:test";

mock.module("isolated-vm", () => ({
  default: {}, // for `import ivm from "isolated-vm"`
  Isolate: class {}, // for `ivm.Isolate`
  Context: class {}, // add whatever your code touches
}));
