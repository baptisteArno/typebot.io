export const openAITasks = [
  'Generate AI Response',
  'Create Speech from Text',
  'Create image',
] as const

export const chatCompletionMessageRoles = [
  'system',
  'user',
  'assistant',
] as const

export const chatCompletionMessageCustomRoles = [
  'Messages sequence ✨',
  'Dialogue',
] as const

export const deprecatedRoles = ['Messages sequence ✨'] as const

export const chatCompletionResponseValues = [
  'Message content',
  'Total tokens',
] as const

export const defaultOpenAIOptions = {
  baseUrl: 'https://api.openai.com/v1',
  task: 'Generate AI Response',
  model: 'gpt-3.5-turbo-0125',
} as const

export const defaultOpenAIResponseMappingItem = {
  valueToExtract: 'Message content',
} as const

export const openAIVoices = [
  'alloy',
  'echo',
  'fable',
  'onyx',
  'nova',
  'shimmer',
] as const
