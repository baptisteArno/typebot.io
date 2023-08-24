import { z } from 'zod'
import { publicTypebotSchema } from '../publicTypebot'
import { preprocessTypebot } from '../typebot/helpers/preprocessTypebot'

export const typebotInSessionStateSchema = z.preprocess(
  preprocessTypebot,
  publicTypebotSchema._def.schema.pick({
    version: true,
    id: true,
    groups: true,
    edges: true,
    variables: true,
  })
)
export type TypebotInSession = z.infer<typeof typebotInSessionStateSchema>

export const dynamicThemeSchema = z.object({
  hostAvatarUrl: z.string().optional(),
  guestAvatarUrl: z.string().optional(),
})
