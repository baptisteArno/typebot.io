import { z } from 'zod'
import { publicTypebotSchema } from '../publicTypebot'

export const typebotInSessionStateSchema = publicTypebotSchema._def.schema.pick(
  {
    id: true,
    groups: true,
    edges: true,
    variables: true,
  }
)
export type TypebotInSession = z.infer<typeof typebotInSessionStateSchema>

export const dynamicThemeSchema = z.object({
  hostAvatarUrl: z.string().optional(),
  guestAvatarUrl: z.string().optional(),
})
