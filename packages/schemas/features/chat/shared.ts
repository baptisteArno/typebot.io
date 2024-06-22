import { z } from '../../zod'
import { publicSniperSchemaV5, publicSniperSchemaV6 } from '../publicSniper'
import { preprocessSniper } from '../sniper/helpers/preprocessSniper'

const sniperInSessionStatePick = {
  version: true,
  id: true,
  groups: true,
  events: true,
  edges: true,
  variables: true,
} as const
export const sniperInSessionStateSchema = z.preprocess(
  preprocessSniper,
  z.discriminatedUnion('version', [
    publicSniperSchemaV5._def.schema.pick(sniperInSessionStatePick),
    publicSniperSchemaV6.pick(sniperInSessionStatePick),
  ])
)
export type SniperInSession = z.infer<typeof sniperInSessionStateSchema>

export const dynamicThemeSchema = z.object({
  hostAvatarUrl: z.string().optional(),
  guestAvatarUrl: z.string().optional(),
})
