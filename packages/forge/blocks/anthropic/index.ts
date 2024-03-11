import { createBlock } from '@typebot.io/forge'
import { AnthropicLogo } from './logo'
import { auth } from './auth'
import { createChatMessage } from './actions/createChatMessage'

export const anthropic = createBlock({
  id: 'anthropic',
  name: 'Anthropic',
  tags: ['ai', 'chat', 'completion', 'claude', 'anthropic'],
  LightLogo: AnthropicLogo,
  auth,
  actions: [createChatMessage],
})
