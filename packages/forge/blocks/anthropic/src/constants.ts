export const anthropicModels = [
  "claude-fable-5-1",
  "claude-opus-5-5",
  "claude-sonnet-5-5",
  "claude-haiku-5-5",
  "claude-fable-5",
  "claude-opus-5",
  "claude-sonnet-5",
  "claude-opus-4-8",
  "claude-opus-4-7",
  "claude-opus-4-6",
  "claude-sonnet-4-6",
  "claude-opus-4-5",
  "claude-haiku-4-5",
  "claude-sonnet-4-5",
];

export const defaultAnthropicMaxTokens = 1024;

export const modelsWithImageUrlSupport = ["claude-*"];

export const supportedImageTypes = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
] as const;

export const maxToolRoundtrips = 10;
