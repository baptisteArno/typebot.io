import { createBlock } from '@typebot.io/forge'
import { OpenRouterLogo } from './logo'
import { auth } from './auth'
import { createChatCompletion } from './actions/createChatCompletion'

export const openRouterBlock = createBlock({
  id: 'open-router',
  name: 'OpenRouter',
  tags: ['ai', 'openai', 'chat', 'completion'],
  LightLogo: OpenRouterLogo,
  auth,
  actions: [createChatCompletion],
})
