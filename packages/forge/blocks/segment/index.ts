import { createBlock } from '@typebot.io/forge'
import { SegmentLogo } from './logo'
import { auth } from './auth'
import { identify } from './actions/identify'
import { trackEvent } from './actions/trackEvent'
import { alias } from './actions/alias'
import { trackPage } from './actions/trackPage'

export const segmentBlock = createBlock({
  id: 'segment',
  name: 'Segment',
  tags: ['events', 'analytics'],
  LightLogo: SegmentLogo,
  auth,
  actions: [alias, identify, trackPage, trackEvent]
})
