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

export const API_URL = "https://api.perplexity.ai/chat/completions";
