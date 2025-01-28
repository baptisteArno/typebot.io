import { Isolate } from "isolated-vm";
import { variablesGlobals } from "./store";

export const getOrCreateIsolate = () => {
  if (!variablesGlobals.isolate) {
    variablesGlobals.isolate = new Isolate();
  }
  return variablesGlobals.isolate;
};
