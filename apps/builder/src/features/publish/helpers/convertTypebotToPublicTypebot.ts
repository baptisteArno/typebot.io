import { createId } from '@paralleldrive/cuid2'
import { PublicTypebot, Typebot } from '@typebot.io/schemas'

export const convertTypebotToPublicTypebot = (
  typebot: Typebot
): PublicTypebot => ({
  id: createId(),
  version: typebot.version,
  typebotId: typebot.id,
  groups: typebot.groups,
  edges: typebot.edges,
  settings: typebot.settings,
  theme: typebot.theme,
  variables: typebot.variables,
  createdAt: new Date(),
  updatedAt: new Date(),
})
