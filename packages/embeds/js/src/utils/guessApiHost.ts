import { getRuntimeVariable } from '@typebot.io/env/getRuntimeVariable'

const chatApiCloudFallbackHost = 'https://chat.typebot.io'

type Params = {
  ignoreChatApiUrl?: boolean
}

export const guessApiHost = (
  { ignoreChatApiUrl }: Params = { ignoreChatApiUrl: false }
) =>
  (ignoreChatApiUrl
    ? undefined
    : getRuntimeVariable('NEXT_PUBLIC_CHAT_API_URL')) ??
  getRuntimeVariable('NEXT_PUBLIC_VIEWER_URL')?.split(',')[0] ??
  chatApiCloudFallbackHost
