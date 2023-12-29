import { z } from '../../zod'
import { publicTypebotSchemaV5, publicTypebotSchemaV6 } from '../publicTypebot'
import { preprocessTypebot } from '../typebot/helpers/preprocessTypebot'

const typebotInSessionStatePick = {
  version: true,
  id: true,
  groups: true,
  events: true,
  edges: true,
  variables: true,
} as const
export const typebotInSessionStateSchema = z.preprocess(
  preprocessTypebot,
  z.discriminatedUnion('version', [
    publicTypebotSchemaV5._def.schema.pick(typebotInSessionStatePick),
    publicTypebotSchemaV6.pick(typebotInSessionStatePick),
  ])
)
export type TypebotInSession = z.infer<typeof typebotInSessionStateSchema>

export const dynamicThemeSchema = z.object({
  hostAvatarUrl: z.string().optional(),
  guestAvatarUrl: z.string().optional(),
})
