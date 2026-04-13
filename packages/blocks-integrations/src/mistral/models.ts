export const mistralModels = [
  {
    id: "mistral-tiny",
    name: "Mistral Tiny",
    description: "Fastest model for simple tasks",
    maxTokens: 32768,
  },
  {
    id: "mistral-small",
    name: "Mistral Small",
    description: "Balanced performance",
    maxTokens: 32768,
  },
  {
    id: "mistral-medium",
    name: "Mistral Medium",
    description: "Higher capability",
    maxTokens: 32768,
  },
  {
    id: "mistral-large-latest",
    name: "Mistral Large",
    description: "Most capable model",
    maxTokens: 128000,
  },
  {
    id: "codestral-latest",
    name: "Codestral",
    description: "Code-specific model",
    maxTokens: 32768,
  },
] as const;

export type MistralModel = (typeof mistralModels)[number];
