import { createBlock } from '@typebot.io/forge'
import { DifyAiLogo } from './logo'
import { auth } from './auth'

export const difyAi = createBlock({
  id: 'dify-ai',
  name: 'Dify.AI',
  tags: [],
  LightLogo: DifyAiLogo,
  auth,
  actions: [],
})
