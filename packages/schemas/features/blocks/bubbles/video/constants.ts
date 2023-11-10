export enum VideoBubbleContentType {
  URL = 'url',
  YOUTUBE = 'youtube',
  VIMEO = 'vimeo',
  TIKTOK = 'tiktok',
}

export const embeddableVideoTypes = [
  VideoBubbleContentType.YOUTUBE,
  VideoBubbleContentType.VIMEO,
  VideoBubbleContentType.TIKTOK,
] as const

export const defaultVideoBubbleContent = {
  height: 400,
  aspectRatio: '16/9',
  maxWidth: '100%',
} as const

export const horizontalVideoSuggestionSize = {
  aspectRation: '16/9',
  maxWidth: '100%',
}

export const verticalVideoSuggestionSize = {
  aspectRation: '9/16',
  maxWidth: '400px',
}

export const youtubeBaseUrl = 'https://www.youtube.com/embed'
export const youtubeRegex =
  /youtube\.com\/(watch\?v=|shorts\/)([\w-]+)|youtu\.be\/([\w-]+)/

export const vimeoBaseUrl = 'https://player.vimeo.com/video'
export const vimeoRegex = /vimeo\.com\/(\d+)/

export const tiktokBaseUrl = 'https://www.tiktok.com/embed/v2'
export const tiktokRegex = /tiktok\.com\/@[\w-]+\/video\/(\d+)/
