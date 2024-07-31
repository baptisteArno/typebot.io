import { createBlock } from '@typebot.io/forge'
import { SegmentLogo } from './logo'
import { auth } from './auth'
import { identify } from './actions/identify'
import { track } from './actions/track'
import { genUUID } from './actions/genuuid'

export const segmentBlock = createBlock({
  id: 'segment',
  name: 'Segment',
  tags: ['events', 'analytics'],
  LightLogo: SegmentLogo,
  auth,
  actions: [identify, genUUID, track], // add page
})
