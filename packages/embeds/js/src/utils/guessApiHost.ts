import { env } from '@typebot.io/lib'

const cloudViewerUrl = 'https://viewer.typebot.io'

export const guessApiHost = () =>
  env('VIEWER_INTERNAL_URL') ??
  env('VIEWER_URL')?.split(',')[0] ??
  cloudViewerUrl
