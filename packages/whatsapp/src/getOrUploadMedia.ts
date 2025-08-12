import { getMediaIdFromCache } from "@typebot.io/bot-engine/mediaCache/getMediaIdFromCache";
import { insertMediaIdToCache } from "@typebot.io/bot-engine/mediaCache/insertMediaIdToCache";
import type { WhatsAppCredentials } from "@typebot.io/credentials/schemas";
import { env } from "@typebot.io/env";
import { ChatProvider } from "@typebot.io/prisma/enum";
import ky from "ky";
import { dialog360AuthHeaderName, dialog360BaseUrl } from "./constants";

export type UploadMediaCache = {
  credentials: WhatsAppCredentials["data"];
  publicTypebotId: string;
};

/**
 * Uploads media to WhatsApp and returns the media ID for immediate use in messages.
 * This eliminates the need for fixed timeouts when sending media messages.
 *
 * Supports both direct buffer uploads and URL-based uploads with automatic downloading.
 * Falls back gracefully by returning null if the upload fails.
 *
 * @param input - Either a buffer with mimeType or a URL to download and upload
 * @param credentials - WhatsApp credentials for API authentication
 * @param cache - Cache configuration
 * @returns Promise resolving to the media ID, or null if upload fails
 */
export const getOrUploadMedia = async ({
  url,
  cache,
}: { url: string; cache: UploadMediaCache }): Promise<string | null> => {
  try {
    const urlWithoutQueryParams = url.split("?")[0];
    if (cache) {
      const mediaId = await getMediaIdFromCache({
        url: urlWithoutQueryParams,
        provider:
          cache.credentials.provider === "360dialog"
            ? ChatProvider.DIALOG360
            : ChatProvider.WHATSAPP,
        publicTypebotId: cache.publicTypebotId,
      });
      if (mediaId) return mediaId;
    }

    // Download the media file from the URL
    const response = await ky.get(url);
    const arrayBuffer = await response.arrayBuffer();
    const file = Buffer.from(arrayBuffer);

    // Get the MIME type from the response headers
    const mimeType =
      response.headers.get("content-type") ?? "application/octet-stream";

    // Upload to WhatsApp
    const formData = new FormData();
    formData.append("file", new Blob([file], { type: mimeType }));
    formData.append("type", mimeType);
    formData.append("messaging_product", "whatsapp");

    let mediaId: string;

    if (cache.credentials.provider === "360dialog") {
      const response = await ky
        .post(`${dialog360BaseUrl}/media`, {
          headers: {
            [dialog360AuthHeaderName]: cache.credentials.apiKey,
          },
          body: formData,
          timeout: false,
        })
        .json<{ id: string }>();

      mediaId = response.id;
    } else {
      const response = await ky
        .post(
          `${env.WHATSAPP_CLOUD_API_URL}/v21.0/${cache.credentials.phoneNumberId}/media`,
          {
            headers: {
              Authorization: `Bearer ${cache.credentials.systemUserAccessToken}`,
            },
            body: formData,
            timeout: false,
          },
        )
        .json<{ id: string }>();

      mediaId = response.id;
    }

    if (cache) {
      insertMediaIdToCache({
        url: urlWithoutQueryParams,
        mediaId,
        provider:
          cache.credentials.provider === "360dialog"
            ? ChatProvider.DIALOG360
            : ChatProvider.WHATSAPP,
        publicTypebotId: cache.publicTypebotId,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
      });
    }

    return mediaId;
  } catch (error) {
    // If upload fails, we'll fall back to using the original approach
    console.warn("Failed to upload media to WhatsApp:", error);
    return null;
  }
};
