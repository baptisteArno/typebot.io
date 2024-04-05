export const anthropicModels = [
  'claude-3-opus-20240229',
  'claude-3-sonnet-20240229',
  'claude-3-haiku-20240307',
  'claude-2.1',
  'claude-2.0',
  'claude-instant-1.2',
] as const

export const defaultAnthropicOptions = {
  model: anthropicModels[0],
  temperature: 1,
  maxTokens: 1024,
} as const
