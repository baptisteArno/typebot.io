export const claudeModels = [
  'claude-2.1',
  'claude-2.0',
  'claude-instant-1.2',
] as const

export const defaultClaudeOptions = {
  baseUrl: 'https://api.openai.com/v1',
  model: claudeModels[0],
  temperature: 1,
  maxTokens: 1024,
} as const
