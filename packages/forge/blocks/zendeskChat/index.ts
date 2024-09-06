import { createBlock } from '@typebot.io/forge'
import { ZendeskChatLogo } from './logo'
import { auth } from './auth'
import { openMessenger } from './actions/openMessenger'

export const zendeskChatBlock = createBlock({
  id: 'zendesk-chat',
  name: 'Zendesk Chat',
  tags: ['chat'],
  LightLogo: ZendeskChatLogo,
  auth,
  actions: [openMessenger],
})
