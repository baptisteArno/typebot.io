import { env } from '@typebot.io/env'

export const isVercel = () => env.NEXT_PUBLIC_VERCEL_ENV
