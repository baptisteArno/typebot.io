import { createBlock } from '@sniper.io/forge'
import { ChatNodeLogo } from './logo'
import { auth } from './auth'
import { sendMessage } from './actions/sendMessage'

export const chatNodeBlock = createBlock({
  id: 'chat-node',
  name: 'ChatNode',
  tags: ['ai', 'openai', 'document', 'url'],
  LightLogo: ChatNodeLogo,
  auth,
  actions: [sendMessage],
})
