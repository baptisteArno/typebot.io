export const anthropicModels = [
  "claude-3-5-sonnet-20240620",
  "claude-3-opus-20240229",
  "claude-3-sonnet-20240229",
  "claude-3-haiku-20240307",
  "claude-2.1",
  "claude-2.0",
  "claude-instant-1.2",
] as const;

export const anthropicLegacyModels = [
  "claude-2.1",
  "claude-2.0",
  "claude-instant-1.2",
];

export const anthropicModelLabels = {
  "claude-3-5-sonnet-20240620": "Claude 3.5 Sonnet",
  "claude-3-opus-20240229": "Claude 3.0 Opus",
  "claude-3-sonnet-20240229": "Claude 3.0 Sonnet",
  "claude-3-haiku-20240307": "Claude 3.0 Haiku",
  "claude-2.1": "Claude 2.1",
  "claude-2.0": "Claude 2.0",
  "claude-instant-1.2": "Claude Instant 1.2",
} satisfies Record<(typeof anthropicModels)[number], string>;

export const defaultAnthropicOptions = {
  model: "claude-3-opus-20240229",
  temperature: 1,
  maxTokens: 1024,
} as const;

export const modelsWithImageUrlSupport = ["claude-3*"];

export const supportedImageTypes = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
] as const;

export const maxToolRoundtrips = 10;
