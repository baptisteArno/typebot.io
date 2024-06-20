import { createId } from '@paralleldrive/cuid2'
import { PublicSniper, SniperV6 } from '@sniper.io/schemas'

export const convertSniperToPublicSniper = (
  sniper: SniperV6
): PublicSniper => ({
  id: createId(),
  version: sniper.version,
  sniperId: sniper.id,
  groups: sniper.groups,
  events: sniper.events,
  edges: sniper.edges,
  settings: sniper.settings,
  theme: sniper.theme,
  variables: sniper.variables,
  createdAt: new Date(),
  updatedAt: new Date(),
})
