import { BubbleBlockType } from "@typebot.io/blocks-bubbles/constants";
import {
  embedBaseUrls,
  embeddableVideoTypes,
  VideoBubbleContentType,
} from "@typebot.io/blocks-bubbles/video/constants";
import type { EmbeddableVideoBubbleContentType } from "@typebot.io/blocks-bubbles/video/schema";
import type { ContinueChatResponse } from "@typebot.io/chat-api/schemas";
import { isSvgSrc } from "@typebot.io/lib/utils";
import { convertRichTextToMarkdown } from "@typebot.io/rich-text/convertRichTextToMarkdown";
import { getOrUploadMedia, type UploadMediaCache } from "./getOrUploadMedia";
import type { WhatsAppSendingMessage } from "./schemas";

type Props = {
  message: ContinueChatResponse["messages"][number];
  mediaCache?: UploadMediaCache;
};
export const convertMessageToWhatsAppMessage = async ({
  message,
  mediaCache,
}: Props): Promise<WhatsAppSendingMessage | null> => {
  switch (message.type) {
    case BubbleBlockType.TEXT: {
      if (message.content.type === "markdown")
        throw new Error("Expect rich text message");
      if (!message.content.richText || message.content.richText.length === 0)
        return null;
      const body = convertRichTextToMarkdown(message.content.richText, {
        flavour: "whatsapp",
      });
      if (!body) return null;
      return {
        type: "text",
        text: {
          body,
        },
      };
    }
    case BubbleBlockType.IMAGE: {
      if (!message.content.url || isImageUrlNotCompatible(message.content.url))
        return null;

      if (mediaCache) {
        const mediaId = await getOrUploadMedia({
          url: message.content.url,
          cache: mediaCache,
        });

        if (mediaId) {
          return {
            type: "image",
            image: {
              id: mediaId,
            },
          };
        }
      }

      return {
        type: "image",
        image: {
          link: message.content.url,
        },
      };
    }
    case BubbleBlockType.AUDIO:
      if (!message.content.url) return null;

      if (mediaCache) {
        const mediaId = await getOrUploadMedia({
          url: message.content.url,
          cache: mediaCache,
        });

        if (mediaId) {
          return {
            type: "audio",
            audio: {
              id: mediaId,
            },
          };
        }
      }

      return {
        type: "audio",
        audio: {
          link: message.content.url,
        },
      };
    case BubbleBlockType.VIDEO:
      if (!message.content.url) return null;
      if (message.content.type === VideoBubbleContentType.URL) {
        // Try to pre-upload media if credentials are provided
        if (mediaCache) {
          const mediaId = await getOrUploadMedia({
            url: message.content.url,
            cache: mediaCache,
          });

          if (mediaId) {
            return {
              type: "video",
              video: {
                id: mediaId,
              },
            };
          }
        }

        // Fall back to using the URL if pre-upload fails or credentials not provided
        return {
          type: "video",
          video: {
            link: message.content.url,
          },
        };
      }
      if (
        embeddableVideoTypes.includes(
          message.content.type as EmbeddableVideoBubbleContentType,
        )
      )
        return {
          type: "text",
          text: {
            body: `${embedBaseUrls[message.content.type as EmbeddableVideoBubbleContentType]}/${message.content.id}`,
            preview_url: true,
          },
        };
      return null;
    case BubbleBlockType.EMBED: {
      if (!message.content.url) return null;
      
      // Check if this is a location embed by looking for location parameters in the URL
      const url = new URL(message.content.url);
      
      // Check for explicit lat/lng parameters
      let latitude = url.searchParams.get('lat') || url.searchParams.get('latitude');
      let longitude = url.searchParams.get('lng') || url.searchParams.get('longitude') || url.searchParams.get('lon');
      
      // Check for coordinates in q parameter (format: ?q=37.7749,-122.4194)
      if (!latitude && !longitude) {
        const qParam = url.searchParams.get('q');
        if (qParam) {
          const coordsMatch = qParam.match(/^(-?\d+(\.\d+)?),(-?\d+(\.\d+)?)$/);
          if (coordsMatch) {
            latitude = coordsMatch[1];
            longitude = coordsMatch[3];
          }
        }
      }
      
      const name = url.searchParams.get('name') || url.searchParams.get('q');
      const address = url.searchParams.get('address');
      
      // If URL contains location parameters, send as a location message
      if (latitude && longitude && !isNaN(Number(latitude)) && !isNaN(Number(longitude))) {
        return {
          type: "location",
          location: {
            latitude: Number(latitude),
            longitude: Number(longitude),
            name: name || undefined,
            address: address || undefined,
          },
        };
      }
      
      // Default to sending the embed URL as a text message with preview
      return {
        type: "text",
        text: {
          body: message.content.url,
          preview_url: true,
        },
      };
    }
    // Location bubble type has been removed in favor of using Embed bubble with Google Maps URL
    case "custom-embed":
      if (!message.content.url) return null;
      return {
        type: "text",
        text: {
          body: message.content.url,
          preview_url: true,
        },
      };
  }
};

export const isImageUrlNotCompatible = (url: string) =>
  !isHttpUrl(url) || isGifFileUrl(url) || isSvgSrc(url);

export const isHttpUrl = (text: string) =>
  text.startsWith("http://") || text.startsWith("https://");

export const isGifFileUrl = (url: string) => {
  const urlWithoutQueryParams = url.split("?")[0];
  return urlWithoutQueryParams.endsWith(".gif");
};
