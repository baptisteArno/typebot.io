import { createBlock } from '@typebot.io/forge'
import { ClaudiaLogo } from './logo'
import { endFlow } from './actions/end-flow'
import { forwardToHuman } from './actions/forward-to-human'
import { closeTicket } from './actions/close-ticket'
import { answerTicket } from './actions/answer_ticket'

export const claudiaBlock = createBlock({
  id: 'claudia',
  name: 'ClaudIA',
  tags: [],
  LightLogo: ClaudiaLogo,
  actions: [endFlow, forwardToHuman, closeTicket, answerTicket],
})
