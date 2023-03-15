import { Log } from '@typebot.io/prisma'

export const sanitizeUrl = (url: string): string =>
  url.startsWith('http') ||
  url.startsWith('mailto:') ||
  url.startsWith('tel:') ||
  url.startsWith('sms:')
    ? url
    : `https://${url}`

export const isMobile =
  typeof window !== 'undefined' &&
  window.matchMedia('only screen and (max-width: 760px)').matches

export const isEmbedded =
  typeof window !== 'undefined' &&
  window.parent &&
  window.location !== window.top?.location

export const parseLog = (
  error: Error | undefined,
  successMessage: string,
  errorMessage: string
): Omit<Log, 'id' | 'createdAt' | 'resultId'> => ({
  status: error ? 'error' : 'success',
  description: error ? errorMessage : successMessage,
  details: (error && JSON.stringify(error, null, 2).substring(0, 1000)) ?? null,
})
