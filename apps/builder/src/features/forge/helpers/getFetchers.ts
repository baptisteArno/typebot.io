import { FetcherDefinition, AuthDefinition } from '@typebot.io/forge'
import { ForgedBlockDefinition } from '@typebot.io/forge-repository/types'

export const getFetchers = (blockDef: ForgedBlockDefinition) =>
  (blockDef.fetchers ?? []).concat(
    blockDef.actions.flatMap(
      (action) => (action.fetchers ?? []) as FetcherDefinition<AuthDefinition>[]
    )
  )
