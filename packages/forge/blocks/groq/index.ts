import { createBlock } from '@typebot.io/forge'
import { GroqLogo } from './logo'
import { auth } from './auth'
import { createChatCompletion } from './actions/createChatCompletion'

export const groqBlock = createBlock({
  id: 'groq',
  name: 'Groq',
  tags: ['ai', 'chat completion', 'bot'],
  LightLogo: GroqLogo,
  auth,
  actions: [createChatCompletion],
})
