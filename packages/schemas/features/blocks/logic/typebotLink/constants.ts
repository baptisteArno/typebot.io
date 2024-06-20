import { SniperLinkBlock } from './schema'

export const defaultSniperLinkOptions = {
  mergeResults: false,
} as const satisfies SniperLinkBlock['options']
