import type { Isolate } from "isolated-vm";

export const variablesGlobals = {
  isolate: undefined as Isolate | undefined,
};

export const resetVariablesGlobals = () => {
  variablesGlobals.isolate?.dispose();
  variablesGlobals.isolate = undefined;
};
