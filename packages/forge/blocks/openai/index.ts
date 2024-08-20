import { OpenAILightLogo, OpenAIDarkLogo } from './logo'
import { createChatCompletion } from './actions/createChatCompletion'
import { createSpeech } from './actions/createSpeech'
import { createBlock } from '@typebot.io/forge'
import { auth } from './auth'
import { baseOptions } from './baseOptions'
import { askAssistant } from './actions/askAssistant'
import { generateVariables } from './actions/generateVariables'
import { createTranscription } from './actions/createTranscription'

export const openAIBlock = createBlock({
  id: 'openai' as const,
  name: 'OpenAI',
  tags: ['openai'],
  LightLogo: OpenAILightLogo,
  DarkLogo: OpenAIDarkLogo,
  auth,
  options: baseOptions,
  actions: [
    createChatCompletion,
    askAssistant,
    generateVariables,
    createSpeech,
    createTranscription,
  ],
  docsUrl: 'https://docs.typebot.io/forge/blocks/openai',
})
