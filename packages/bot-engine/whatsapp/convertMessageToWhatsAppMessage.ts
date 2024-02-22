import { ContinueChatResponse } from '@typebot.io/schemas'
import { WhatsAppSendingMessage } from '@typebot.io/schemas/features/whatsapp'
import { isSvgSrc } from '@typebot.io/lib/utils'
import { BubbleBlockType } from '@typebot.io/schemas/features/blocks/bubbles/constants'
import { VideoBubbleContentType } from '@typebot.io/schemas/features/blocks/bubbles/video/constants'
import { convertRichTextToMarkdown } from '@typebot.io/lib/markdown/convertRichTextToMarkdown'

const mp4HttpsUrlRegex = /^https:\/\/.*\.mp4$/

export const convertMessageToWhatsAppMessage = (
  message: ContinueChatResponse['messages'][number]
): WhatsAppSendingMessage | undefined => {
  switch (message.type) {
    case BubbleBlockType.TEXT: {
      if (!message.content.richText || message.content.richText.length === 0)
        return
      return {
        type: 'text',
        text: {
          body: convertRichTextToMarkdown(message.content.richText, {
            flavour: 'whatsapp',
          }),
        },
      }
    }
    case BubbleBlockType.IMAGE: {
      if (!message.content.url || isImageUrlNotCompatible(message.content.url))
        return
      return {
        type: 'image',
        image: {
          link: message.content.url,
        },
      }
    }
    case BubbleBlockType.AUDIO: {
      if (!message.content.url) return
      return {
        type: 'audio',
        audio: {
          link: message.content.url,
        },
      }
    }
    case BubbleBlockType.VIDEO: {
      if (
        !message.content.url ||
        (message.content.type !== VideoBubbleContentType.URL &&
          isVideoUrlNotCompatible(message.content.url))
      )
        return
      return {
        type: 'video',
        video: {
          link: message.content.url,
        },
      }
    }
    case BubbleBlockType.EMBED: {
      if (!message.content.url) return
      return {
        type: 'text',
        text: {
          body: message.content.url,
        },
        preview_url: true,
      }
    }
  }
}

export const isImageUrlNotCompatible = (url: string) =>
  !isHttpUrl(url) || isGifFileUrl(url) || isSvgSrc(url)

export const isVideoUrlNotCompatible = (url: string) =>
  !mp4HttpsUrlRegex.test(url)

export const isHttpUrl = (text: string) =>
  text.startsWith('http://') || text.startsWith('https://')

export const isGifFileUrl = (url: string) => {
  const urlWithoutQueryParams = url.split('?')[0]
  return urlWithoutQueryParams.endsWith('.gif')
}
