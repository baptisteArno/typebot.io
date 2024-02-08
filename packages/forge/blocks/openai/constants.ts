export const openAIVoices = [
  'alloy',
  'echo',
  'fable',
  'onyx',
  'nova',
  'shimmer',
] as const

export const defaultOpenAIOptions = {
  baseUrl: 'https://api.openai.com/v1',
  apiVersion: '',
  model: 'gpt-3.5-turbo-0125',
  voiceModel: 'tts-1',
  temperature: 1,
} as const

export const maxToolCalls = 10
