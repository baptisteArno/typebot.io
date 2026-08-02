import { BubbleBlockType } from "@typebot.io/blocks-bubbles/constants";
import {
  embedBaseUrls,
  embeddableVideoTypes,
  VideoBubbleContentType,
} from "@typebot.io/blocks-bubbles/video/constants";
import type { EmbeddableVideoBubbleContentType } from "@typebot.io/blocks-bubbles/video/schema";
import type { ContinueChatResponse } from "@typebot.io/chat-api/schemas";
import { extensionFromMimeType } from "@typebot.io/lib/extensionFromMimeType";
import { isSvgSrc } from "@typebot.io/lib/utils";
import { convertRichTextToMarkdown } from "@typebot.io/rich-text/convertRichTextToMarkdown";
import { getOrUploadMedia, type UploadMediaCache } from "./getOrUploadMedia";
import type { WhatsAppSendingMessage } from "./schemas";

// Any file extension not in this set is sent as a downloadable "document" —
// WhatsApp's Cloud API doesn't restrict document mime types the way it does
// image/audio/video, so we don't need to whitelist known document extensions.
const mediaFileExtensions = new Set(
  Object.entries(extensionFromMimeType)
    .filter(
      ([mimeType]) =>
        mimeType.startsWith("audio/") ||
        mimeType.startsWith("video/") ||
        mimeType.startsWith("image/"),
    )
    .map(([, extension]) => extension),
);

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
      // Derived from the URL's pathname rather than the raw string so a
      // bare domain (e.g. "https://example.com") isn't mistaken for a
      // filename with a "com" extension.
      let filename: string | undefined;
      let fileExtension: string | undefined;
      try {
        const pathSegment = new URL(message.content.url).pathname
          .split("/")
          .pop();
        if (pathSegment?.includes(".")) {
          filename = pathSegment;
          fileExtension = pathSegment.split(".").pop()?.toLowerCase();
        }
      } catch {
        // Not an absolute URL, treat as a plain link below.
      }
      if (fileExtension && !mediaFileExtensions.has(fileExtension)) {
        if (mediaCache) {
          const mediaId = await getOrUploadMedia({
            url: message.content.url,
            cache: mediaCache,
          });

          if (mediaId) {
            return {
              type: "document",
              document: {
                id: mediaId,
                filename,
              },
            };
          }
        }

        return {
          type: "document",
          document: {
            link: message.content.url,
            filename,
          },
        };
      }
      return {
        type: "text",
        text: {
          body: message.content.url,
          preview_url: true,
        },
      };
    }
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
