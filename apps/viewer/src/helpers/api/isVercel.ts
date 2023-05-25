import { isDefined } from '@typebot.io/lib/utils'

export const isVercel = () => isDefined(process.env.NEXT_PUBLIC_VERCEL_ENV)
