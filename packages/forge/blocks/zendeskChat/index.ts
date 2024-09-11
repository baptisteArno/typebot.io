import { createBlock } from '@typebot.io/forge'
import { ZendeskLogo } from './logo'
import { auth } from './auth'
import { openWebWidget } from './actions/openWebWidget'
import { authenticate } from './actions/authenticate'

export const zendeskChatBlock = createBlock({
  id: 'zendesk-messaging',
  name: 'Zendesk Messaging',
  tags: ['live chat'],
  LightLogo: ZendeskLogo,
  auth,
  actions: [authenticate, openWebWidget],
})
