export const claudeModels = [
  'claude-3-opus-20240229',
  'claude-2.1',
  'claude-2.0',
  'claude-instant-1.2',
] as const

export const defaultClaudeOptions = {
  model: claudeModels[0],
  temperature: 1,
  maxTokens: 1024,
} as const
