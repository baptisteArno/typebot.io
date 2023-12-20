import { OpenAILightLogo, OpenAIDarkLogo } from './logo'
import { createChatCompletion } from './actions/createChatCompletion'
import { createSpeech } from './actions/createSpeech'
import { createBlock } from '@typebot.io/forge'
import { auth } from './auth'
import { baseOptions } from './baseOptions'

export const openAIBlock = createBlock({
  id: 'openai' as const,
  name: 'OpenAI',
  tags: ['openai'],
  LightLogo: OpenAILightLogo,
  DarkLogo: OpenAIDarkLogo,
  auth,
  options: baseOptions,
  actions: [createChatCompletion, createSpeech],
})
