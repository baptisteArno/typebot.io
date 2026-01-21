// Price per million tokens (USD)
export const AI_MODEL_PRICING = {
  "gpt-5": { input: 1.25, cachedInput: 0.125, output: 10.0 },
  "gpt-5.1": { input: 1.25, cachedInput: 0.125, output: 10.0 },
  "gpt-5.2": { input: 1.75, cachedInput: 0.175, output: 14.0 },
} as const;

export type AiModelId = keyof typeof AI_MODEL_PRICING;

type InputTokenDetails = {
  cachedTokens?: number;
};

export const calculateCost = (
  modelId: AiModelId,
  inputTokens: number,
  outputTokens: number,
  inputTokenDetails?: InputTokenDetails,
): number => {
  const pricing = AI_MODEL_PRICING[modelId];
  const cachedTokens = inputTokenDetails?.cachedTokens ?? 0;
  const nonCachedInputTokens = inputTokens - cachedTokens;

  return (
    (nonCachedInputTokens * pricing.input +
      cachedTokens * pricing.cachedInput +
      outputTokens * pricing.output) /
    1_000_000
  );
};
