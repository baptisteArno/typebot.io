import { createBlock } from '@typebot.io/forge'
import { TogetherAiLogo } from './logo'
import { auth } from './auth'
import { createChatCompletion } from './actions/createChatCompletion'

export const togetherAiBlock = createBlock({
  id: 'together-ai',
  name: 'Together',
  fullName: 'Together AI',
  tags: ['ai', 'openai', 'chat', 'completion'],
  LightLogo: TogetherAiLogo,
  auth,
  actions: [createChatCompletion],
})
