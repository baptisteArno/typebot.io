import { getRuntimeVariable } from '@typebot.io/env/getRuntimeVariable'

const chatApiCloudFallbackHost = 'https://typebot.io'

type Params = {
  ignoreChatApiUrl?: boolean
}

export const guessApiHost = (
  { ignoreChatApiUrl }: Params = { ignoreChatApiUrl: false }
) => {
  const chatApiUrl = getRuntimeVariable('NEXT_PUBLIC_CHAT_API_URL')
  const newChatApiOnUrls = (
    getRuntimeVariable('NEXT_PUBLIC_USE_EXPERIMENTAL_CHAT_API_ON') as
      | string
      | undefined
  )?.split(',')

  if (
    !ignoreChatApiUrl &&
    chatApiUrl &&
    (!newChatApiOnUrls ||
      newChatApiOnUrls.some((url) => url === window.location.href))
  ) {
    return chatApiUrl
  }

  const viewerUrls = getRuntimeVariable('NEXT_PUBLIC_VIEWER_URL')?.split(
    ','
  ) as string[] | undefined

  const matchedUrl = viewerUrls?.find((url) =>
    window.location.href.startsWith(url)
  )

  return matchedUrl ?? viewerUrls?.[0] ?? chatApiCloudFallbackHost
}
