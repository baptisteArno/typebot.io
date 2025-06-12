import type { LoopBlock } from "./schema";

export const MAX_ITERATIONS = 100;

export const defaultLoopOptions = {
  iterations: 3,
} as const satisfies LoopBlock["options"];
