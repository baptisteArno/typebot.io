import { env } from '@typebot.io/env'

export const isCloudProdInstance = () => {
  if (typeof window !== 'undefined') {
    return window.location.hostname === 'app.flowdacity.com'
  }
  return env.NEXTAUTH_URL === 'https://app.flowdacity.com'
}
