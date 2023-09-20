import { isNotDefined } from '@typebot.io/lib/utils'

export const formatLogDetails = (details: unknown): string | null => {
  if (isNotDefined(details)) return null
  if (details instanceof Error) return details.toString()
  try {
    return JSON.stringify(details, null, 2).substring(0, 1000)
  } catch {
    return null
  }
}
