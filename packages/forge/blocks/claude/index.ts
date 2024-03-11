import { createBlock } from '@typebot.io/forge'
import { ClaudeLogo } from './logo'
import { auth } from './auth'
import { createChatMessage } from './actions/createChatMessage'

export const claude = createBlock({
  id: 'claude',
  name: 'Claude',
  tags: ['ai', 'chat', 'completion', 'claude', 'anthropic'],
  LightLogo: ClaudeLogo,
  auth,
  actions: [createChatMessage],
})
