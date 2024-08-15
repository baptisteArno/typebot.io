import { createBlock } from '@typebot.io/forge'
import { ClaudiaLogo } from './logo'
import { endFLow } from './actions/end-flow'
import { forwardToHuman } from './actions/forward-to-human'
import { closeTicket } from './actions/close-ticket'

export const claudiaBlock = createBlock({
  id: 'claudia',
  name: 'ClaudIA',
  tags: [],
  LightLogo: ClaudiaLogo,
  actions: [endFLow, forwardToHuman, closeTicket],
})
