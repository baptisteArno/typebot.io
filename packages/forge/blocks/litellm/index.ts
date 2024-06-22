import { askAssistant } from './actions/askAssistant'
import { auth } from './auth'
import { createBlock } from '@typebot.io/forge'
import { createChatCompletion } from './actions/createChatCompletion'
import { createSpeech } from './actions/createSpeech'
import { generateVariables } from './actions/generateVariables'
import { LitellmLogo } from './logo'


export const litellmBlock = createBlock({
  id: 'litellm',
  name: 'LiteLLM',
  tags: ['litellm'],
  LightLogo: LitellmLogo,
  auth,
  actions: [
    createChatCompletion,
    askAssistant,
    generateVariables,
    createSpeech,
  ],
})
