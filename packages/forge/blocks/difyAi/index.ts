import { createBlock } from '@typebot.io/forge'
import { DifyAiLogo } from './logo'
import { auth } from './auth'
import { createChatMessage } from './actions/createChatMessage'

export const difyAi = createBlock({
  id: 'dify-ai',
  name: 'Dify.AI',
  tags: ['dify', 'ai', 'documents', 'files', 'knowledge base'],
  fullName:
    'Connect Diffy AI where you can create your own custom AI assistant using a custom knowledge base',
  LightLogo: DifyAiLogo,
  auth,
  actions: [createChatMessage],
})
