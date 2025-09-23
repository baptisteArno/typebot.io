import { env } from '@typebot.io/env'
import { isOriginAllowed as checkOriginAllowed } from '@typebot.io/lib/origin'

// Helper function to get the allowed origins for postMessage
export const getAllowedOrigins = (): string[] => {
  const allowedOrigins = env.NEXT_PUBLIC_EMBEDDED_AUTH_ALLOWED_ORIGIN
  if (!allowedOrigins) {
    return ['http://localhost:3000']
  }
  return Array.isArray(allowedOrigins) ? allowedOrigins : [allowedOrigins]
}

// Helper function to get the first allowed origin for postMessage (backward compatibility)
export const getAllowedOrigin = (): string => {
  const origins = getAllowedOrigins()
  return origins[0]
}

// Helper function to check if an origin is allowed
export const isOriginAllowed = (origin: string): boolean => {
  const allowedOrigins = getAllowedOrigins()
  return checkOriginAllowed(origin, allowedOrigins)
}
