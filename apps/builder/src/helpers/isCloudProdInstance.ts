import { env } from '@sniper.io/env'

export const isCloudProdInstance = () => {
  if (typeof window !== 'undefined') {
    return window.location.hostname === 'app.sniper.io'
  }
  return env.NEXTAUTH_URL === 'https://app.sniper.io'
}
