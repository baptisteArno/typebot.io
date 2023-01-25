import { env } from 'utils'

const cloudViewerUrl = 'https://viewer.typebot.io'

export const guessApiHost = () =>
  env('VIEWER_URL')?.split(',')[0] ?? cloudViewerUrl
