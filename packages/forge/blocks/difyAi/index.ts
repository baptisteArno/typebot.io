import { createBlock } from '@typebot.io/forge'
import { DifyAiLogo } from './logo'
import { auth } from './auth'

export const difyAi = createBlock({
  id: 'dify-ai',
  name: 'Dify.AI',
  tags: ['dify', 'ai', 'documents', 'files', 'knowledge base'],
  LightLogo: DifyAiLogo,
  auth,
  actions: [],
})
