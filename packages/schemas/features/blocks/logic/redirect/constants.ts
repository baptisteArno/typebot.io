import { RedirectBlock } from './schema'

export const defaultRedirectOptions = {
  isNewTab: false,
} as const satisfies RedirectBlock['options']
