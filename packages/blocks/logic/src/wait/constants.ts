import type { WaitBlock } from "./schema";

export const defaultWaitOptions = {
  shouldPause: false,
} as const satisfies WaitBlock["options"];
