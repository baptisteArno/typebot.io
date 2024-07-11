export enum VideoBubbleContentType {
  URL = 'url',
  YOUTUBE = 'youtube',
  VIMEO = 'vimeo',
  TIKTOK = 'tiktok',
  GUMLET = 'gumlet',
}

export const embeddableVideoTypes = [
  VideoBubbleContentType.YOUTUBE,
  VideoBubbleContentType.VIMEO,
  VideoBubbleContentType.TIKTOK,
  VideoBubbleContentType.GUMLET,
] as const

export const defaultVideoBubbleContent = {
  height: 400,
  aspectRatio: '16/9',
  maxWidth: '100%',
  areControlsDisplayed: true,
  isAutoplayEnabled: true,
} as const

export const horizontalVideoSuggestionSize = {
  aspectRatio: '16/9',
  maxWidth: '100%',
}

export const verticalVideoSuggestionSize = {
  aspectRatio: '9/16',
  maxWidth: '400px',
}

const youtubeBaseUrl = 'https://www.youtube.com/embed'
export const youtubeRegex =
  /youtube\.com\/(watch\?v=|shorts\/)([\w-]+)|youtu\.be\/([\w-]+)(\?.+)*/

export const youtubeEmbedParamsMap = {
  t: 'start',
}

const vimeoBaseUrl = 'https://player.vimeo.com/video'
export const vimeoRegex = /vimeo\.com\/(\d+)/

const tiktokBaseUrl = 'https://www.tiktok.com/embed/v2'
export const tiktokRegex = /tiktok\.com\/@[\w-]+\/video\/(\d+)/

const gumletBaseUrl = 'https://play.gumlet.io/embed'
export const gumletRegex = /gumlet\.com\/watch\/(\w+)/

export const oneDriveRegex = /https:\/\/onedrive.live.com\/embed\?[^"]+/

export const embedBaseUrls = {
  [VideoBubbleContentType.VIMEO]: vimeoBaseUrl,
  [VideoBubbleContentType.YOUTUBE]: youtubeBaseUrl,
  [VideoBubbleContentType.TIKTOK]: tiktokBaseUrl,
  [VideoBubbleContentType.GUMLET]: gumletBaseUrl,
} as const
