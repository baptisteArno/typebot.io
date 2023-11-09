import {
  VideoBubbleContentType,
  tiktokBaseUrl,
  tiktokRegex,
  vimeoBaseUrl,
  vimeoRegex,
  youtubeBaseUrl,
  youtubeRegex,
} from '@typebot.io/schemas/features/blocks/bubbles/video/constants'

export const parseVideoUrl = (
  url: string
): { type: VideoBubbleContentType; url: string; id?: string } => {
  if (youtubeRegex.test(url)) {
    const match = url.match(youtubeRegex)
    const id = match?.at(2) ?? match?.at(3)
    const parsedUrl = match?.at(0) ?? url
    if (!id) return { type: VideoBubbleContentType.URL, url: parsedUrl }
    return { type: VideoBubbleContentType.YOUTUBE, url: parsedUrl, id }
  }
  if (vimeoRegex.test(url)) {
    const match = url.match(vimeoRegex)
    const id = match?.at(1)
    const parsedUrl = match?.at(0) ?? url
    if (!id) return { type: VideoBubbleContentType.URL, url: parsedUrl }
    return { type: VideoBubbleContentType.VIMEO, url: parsedUrl, id }
  }
  if (tiktokRegex.test(url)) {
    const match = url.match(tiktokRegex)
    const id = url.match(tiktokRegex)?.at(1)
    const parsedUrl = match?.at(0) ?? url
    if (!id) return { type: VideoBubbleContentType.URL, url: parsedUrl }
    return { type: VideoBubbleContentType.TIKTOK, url: parsedUrl, id }
  }
  return { type: VideoBubbleContentType.URL, url }
}
