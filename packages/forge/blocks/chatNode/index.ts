import { createBlock } from '@typebot.io/forge'
import { ChatNodeLogo } from './logo'
import { auth } from './auth'

export const chatNode = createBlock({
  id: 'chat-node',
  name: 'ChatNode',
  tags: ['ai', "openai", "document", "url"],
  LightLogo: ChatNodeLogo,
  auth,
  actions: [],
})
