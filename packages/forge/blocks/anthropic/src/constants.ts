export const anthropicModels = [
  "claude-sonnet-4-0",
  "claude-opus-4-0",
  "claude-3-7-sonnet-latest",
  "claude-3-5-haiku-latest",
  "claude-3-5-sonnet-latest",
  "claude-3-opus-latest",
];

export const defaultAnthropicMaxTokens = 1024;

export const modelsWithImageUrlSupport = ["claude-3*"];

export const supportedImageTypes = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
] as const;

export const maxToolRoundtrips = 10;
