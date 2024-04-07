import {
  VideoBubbleContentType,
  youtubeRegex,
  verticalVideoSuggestionSize,
  horizontalVideoSuggestionSize,
  vimeoRegex,
  tiktokRegex,
  gumletRegex,
  oneDriveRegex,
} from './constants'
import { VideoBubbleBlock } from './schema'

export const parseVideoUrl = (
  url: string
): {
  type: VideoBubbleContentType
  url: string
  id?: string
  videoSizeSuggestion?: Pick<
    NonNullable<VideoBubbleBlock['content']>,
    'aspectRatio' | 'maxWidth'
  >
} => {
  if (youtubeRegex.test(url)) {
    const match = url.match(youtubeRegex)
    const id = match?.at(2) ?? match?.at(3)
    const parsedUrl = match?.at(0) ?? url
    if (!id) return { type: VideoBubbleContentType.URL, url: parsedUrl }
    return {
      type: VideoBubbleContentType.YOUTUBE,
      url: parsedUrl,
      id,
      videoSizeSuggestion: url.includes('shorts')
        ? verticalVideoSuggestionSize
        : horizontalVideoSuggestionSize,
    }
  }
  if (vimeoRegex.test(url)) {
    const match = url.match(vimeoRegex)
    const id = match?.at(1)
    const parsedUrl = match?.at(0) ?? url
    if (!id) return { type: VideoBubbleContentType.URL, url: parsedUrl }
    return {
      type: VideoBubbleContentType.VIMEO,
      url: parsedUrl,
      id,
      videoSizeSuggestion: horizontalVideoSuggestionSize,
    }
  }
  if (tiktokRegex.test(url)) {
    const match = url.match(tiktokRegex)
    const id = url.match(tiktokRegex)?.at(1)
    const parsedUrl = match?.at(0) ?? url
    if (!id) return { type: VideoBubbleContentType.URL, url: parsedUrl }
    return {
      type: VideoBubbleContentType.TIKTOK,
      url: parsedUrl,
      id,
      videoSizeSuggestion: verticalVideoSuggestionSize,
    }
  }
  if (gumletRegex.test(url)) {
    const match = url.match(gumletRegex)
    const id = match?.at(1)
    const parsedUrl = match?.at(0) ?? url
    if (!id) return { type: VideoBubbleContentType.URL, url: parsedUrl }
    return {
      type: VideoBubbleContentType.GUMLET,
      url: parsedUrl,
      id,
      videoSizeSuggestion: horizontalVideoSuggestionSize,
    }
  }
  if (oneDriveRegex.test(url)) {
    const match = url.match(oneDriveRegex)
    const parsedUrl = match?.at(0) ?? url
    return {
      type: VideoBubbleContentType.URL,
      url: parsedUrl.replace('/embed', '/download'),
    }
  }
  return { type: VideoBubbleContentType.URL, url }
}
