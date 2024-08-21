export const openAIVoices = [
  'alloy',
  'echo',
  'fable',
  'onyx',
  'nova',
  'shimmer',
] as const

export const modelsWithImageUrlSupport = [
  'gpt-4-turbo*',
  'gpt-4o*',
  'gpt-4*vision-preview',
]

export const excludedModelsFromImageUrlSupport = ['gpt-4-turbo-preview']

export const defaultOpenAIOptions = {
  model: 'gpt-4o-mini',
  voiceModel: 'tts-1',
  temperature: 1,
} as const

export const maxToolCalls = 10
