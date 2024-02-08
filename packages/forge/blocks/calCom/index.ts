import { createBlock } from '@typebot.io/forge'
import { CalComLogo } from './logo'
import { bookEvent } from './actions/bookEvent'
import { baseOptions } from './baseOptions'

export const calCom = createBlock({
  id: 'cal-com',
  name: 'Cal.com',
  tags: ['calendar', 'scheduling', 'meetings'],
  fullName:
    'Integrate with Cal.com for streamlined scheduling and calendar management',
  LightLogo: CalComLogo,
  options: baseOptions,
  actions: [bookEvent],
})
