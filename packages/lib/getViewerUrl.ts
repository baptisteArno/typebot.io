import { env } from '@typebot.io/env'

export const getViewerUrl = () =>
  env.NEXT_PUBLIC_VIEWER_INTERNAL_URL ?? env.NEXT_PUBLIC_VIEWER_URL[0]
