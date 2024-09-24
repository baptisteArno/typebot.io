import type { ScriptBlock } from "./schema";

export const defaultScriptOptions = {
  name: "Script",
  isExecutedOnClient: true,
} as const satisfies ScriptBlock["options"];
