import { z } from '../../../zod'
import { eventBaseSchema } from '../shared'
import { EventType } from '../constants'

export const startEventSchema = eventBaseSchema
  .extend({
    type: z.literal(EventType.START),
  })
  .openapi({
    description: 'Event',
    ref: 'event',
  })
