import { env } from '@typebot.io/env'

const cloudViewerUrl = 'https://viewer.typebot.io'

export const guessApiHost = () =>
  env.NEXT_PUBLIC_VIEWER_INTERNAL_URL ??
  env.NEXT_PUBLIC_VIEWER_URL[0] ??
  cloudViewerUrl
