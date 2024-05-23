import {
  ContinueChatResponse,
  EmbeddableVideoBubbleContentType,
} from '@typebot.io/schemas'
import { WhatsAppSendingMessage } from '@typebot.io/schemas/features/whatsapp'
import { isSvgSrc } from '@typebot.io/lib/utils'
import { BubbleBlockType } from '@typebot.io/schemas/features/blocks/bubbles/constants'
import {
  VideoBubbleContentType,
  embedBaseUrls,
  embeddableVideoTypes,
} from '@typebot.io/schemas/features/blocks/bubbles/video/constants'
import { convertRichTextToMarkdown } from '@typebot.io/lib/markdown/convertRichTextToMarkdown'

export const convertMessageToWhatsAppMessage = (
  message: ContinueChatResponse['messages'][number]
): WhatsAppSendingMessage | null => {
  switch (message.type) {
    case BubbleBlockType.TEXT: {
      if (message.content.type === 'markdown')
        throw new Error('Expect rich text message')
      if (!message.content.richText || message.content.richText.length === 0)
        return null
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
        return null
      return {
        type: 'image',
        image: {
          link: message.content.url,
        },
      }
    }
    case BubbleBlockType.AUDIO: {
      if (!message.content.url) return null
      return {
        type: 'audio',
        audio: {
          link: message.content.url,
        },
      }
    }
    case BubbleBlockType.VIDEO: {
      if (!message.content.url) return null
      if (message.content.type === VideoBubbleContentType.URL)
        return {
          type: 'video',
          video: {
            link: message.content.url,
          },
        }
      if (
        embeddableVideoTypes.includes(
          message.content.type as EmbeddableVideoBubbleContentType
        )
      )
        return {
          type: 'text',
          text: {
            body: `${
              embedBaseUrls[
                message.content.type as EmbeddableVideoBubbleContentType
              ]
            }/${message.content.id}`,
            preview_url: true,
          },
        }
      return null
    }
    case BubbleBlockType.EMBED: {
      if (!message.content.url) return null
      return {
        type: 'text',
        text: {
          body: message.content.url,
          preview_url: true,
        },
      }
    }
    case 'custom-embed': {
      if (!message.content.url) return null
      return {
        type: 'text',
        text: {
          body: message.content.url,
          preview_url: true,
        },
      }
    }
  }
}

export const isImageUrlNotCompatible = (url: string) =>
  !isHttpUrl(url) || isGifFileUrl(url) || isSvgSrc(url)

export const isHttpUrl = (text: string) =>
  text.startsWith('http://') || text.startsWith('https://')

export const isGifFileUrl = (url: string) => {
  const urlWithoutQueryParams = url.split('?')[0]
  return urlWithoutQueryParams.endsWith('.gif')
}
