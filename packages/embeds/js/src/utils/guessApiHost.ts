import { getRuntimeVariable } from '@typebot.io/env/getRuntimeVariable'

const cloudViewerUrl = 'https://typebot.io'

export const guessApiHost = () =>
  getRuntimeVariable('NEXT_PUBLIC_VIEWER_URL')?.split(',')[0] ?? cloudViewerUrl
