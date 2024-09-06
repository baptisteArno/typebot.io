import { ForgedBlockDefinition } from '@typebot.io/forge-repository/types'
import { getFetchers } from './getFetchers'

export const findFetcher = (
  blockDef: ForgedBlockDefinition,
  fetcherId: string
) => getFetchers(blockDef).find((fetcher) => fetcher.id === fetcherId)
