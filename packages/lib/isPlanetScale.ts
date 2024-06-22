import { env } from '@sniper.io/env'

export const isPlaneteScale = () => env.DATABASE_URL?.includes('pscale_pw')
