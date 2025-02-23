export const perplexityModels = [
  "sonar-reasoning-pro",
  "sonar-reasoning",
  "sonar-pro",
  "sonar",
] as const;

export const defaultPerplexityOptions = {
  model: "sonar",
  temperature: 1,
  maxTokens: 1024,
} as const;

export const defaultBaseUrl = "https://api.perplexity.ai";
