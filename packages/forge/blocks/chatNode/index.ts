import { createBlock } from '@typebot.io/forge'
import { ChatNodeLogo } from './logo'
import { auth } from './auth'
import { sendMessage } from './actions/sendMessage'

export const chatNode = createBlock({
  id: 'chat-node',
  name: 'ChatNode',
  tags: ['ai', 'openai', 'document', 'url'],
  fullName:
    'Enhance user engagement with Chatnode integration for dynamic conversation experiences',
  LightLogo: ChatNodeLogo,
  auth,
  actions: [sendMessage],
})
