import { env } from '@typebot.io/env'

// Helper function to get the allowed origin for postMessage
export const getAllowedOrigin = (): string => {
  return env.NEXT_PUBLIC_EMBEDDED_AUTH_ALLOWED_ORIGIN || 'http://localhost:3000'
}
