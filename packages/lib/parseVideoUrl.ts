import { VideoBubbleContentType } from '@typebot.io/schemas/features/blocks/bubbles/video/enums'

const vimeoRegex = /vimeo\.com\/(\d+)/
const youtubeRegex =
  /youtube\.com\/(watch\?v=|shorts\/)([\w-]+)|youtu\.be\/([\w-]+)/

export const parseVideoUrl = (
  url: string
): { type: VideoBubbleContentType; url: string; id?: string } => {
  if (vimeoRegex.test(url)) {
    const id = url.match(vimeoRegex)?.at(1)
    if (!id) return { type: VideoBubbleContentType.URL, url }
    return { type: VideoBubbleContentType.VIMEO, url, id }
  }
  if (youtubeRegex.test(url)) {
    const id = url.match(youtubeRegex)?.at(2) ?? url.match(youtubeRegex)?.at(3)
    if (!id) return { type: VideoBubbleContentType.URL, url }
    return { type: VideoBubbleContentType.YOUTUBE, url, id }
  }
  return { type: VideoBubbleContentType.URL, url }
}
