import { createBlock } from '@typebot.io/forge'
import { ZendeskChatLogo } from './logo'
import { auth } from './auth'
import { openMessenger } from './actions/openMessenger'
import { authenticate } from './actions/authenticate'

export const zendeskChatBlock = createBlock({
  id: 'zendesk-chat',
  name: 'Zendesk Chat',
  tags: ['live chat'],
  LightLogo: ZendeskChatLogo,
  auth,
  actions: [authenticate, openMessenger],
})
