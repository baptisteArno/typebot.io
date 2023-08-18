import { isNotDefined } from './utils'

export const safeStringify = (val: unknown): string | null => {
  if (isNotDefined(val)) return null
  if (typeof val === 'string') return val
  try {
    return JSON.stringify(val)
  } catch {
    console.warn('Failed to safely stringify variable value', val)
    return null
  }
}
