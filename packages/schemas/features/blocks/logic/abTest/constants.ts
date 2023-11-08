import { AbTestBlock } from './schema'

export const defaultAbTestOptions = {
  aPercent: 50,
} as const satisfies AbTestBlock['options']
