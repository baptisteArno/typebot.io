import { createBlock } from '@typebot.io/forge'
import { ClaudeLogo } from './logo'
import { auth } from './auth'
import { createMessage } from './actions/createMessage'

export const claude = createBlock({
  id: 'claude',
  name: 'Claude',
  tags: [],
  LightLogo: ClaudeLogo,
  auth,
  actions: [createMessage],
})
