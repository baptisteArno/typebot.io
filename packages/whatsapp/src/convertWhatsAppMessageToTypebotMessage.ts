import type { Block } from "@typebot.io/blocks-core/schemas/schema";
import { InputBlockType } from "@typebot.io/blocks-inputs/constants";
import type { Message } from "@typebot.io/chat-api/schemas";
import type { WhatsAppCredentials } from "@typebot.io/credentials/schemas";
import { env } from "@typebot.io/env";
import { extensionFromMimeType } from "@typebot.io/lib/extensionFromMimeType";
import { uploadFileToBucket } from "@typebot.io/lib/s3/uploadFileToBucket";
import { downloadMedia } from "./downloadMedia";
import type { WhatsAppIncomingMessage } from "./schemas";

export const convertWhatsAppMessageToTypebotMessage = async ({
  messages,
  workspaceId,
  credentials,
  typebotId,
  resultId,
  block,
}: {
  messages: WhatsAppIncomingMessage[];
  workspaceId?: string;
  credentials: WhatsAppCredentials["data"];
  typebotId?: string;
  resultId?: string;
  block?: Block;
}): Promise<Message | undefined> => {
  let text = "";
  const append = (s: string) => {
    text = text !== "" ? `${text}\n\n${s}` : s;
  };
  let replyId: string | undefined;
  const attachedFileUrls: string[] = [];
  for (const message of messages) {
    switch (message.type) {
      case "text": {
        append(message.text.body);
        break;
      }
      case "button": {
        append(message.button.text);
        break;
      }
      case "interactive": {
        switch (message.interactive?.type) {
          case "button_reply": {
            replyId = message.interactive.button_reply.id;
            append(message.interactive.button_reply.title);
            break;
          }
          case "list_reply": {
            replyId = message.interactive.list_reply.id;
            append(message.interactive.list_reply.title);
            break;
          }
        }
        break;
      }
      case "document":
      case "audio":
      case "video":
      case "sticker":
      case "image": {
        let mediaId: string | undefined;
        let mimeType: string | undefined;
        if (message.type === "video") {
          mediaId = message.video.id;
          mimeType = message.video.mime_type;
        }
        if (message.type === "image") {
          mediaId = message.image.id;
          mimeType = message.image.mime_type;
        }
        if (message.type === "audio") {
          mediaId = message.audio.id;
          mimeType = message.audio.mime_type;
        }
        if (message.type === "document") {
          mediaId = message.document.id;
          mimeType = message.document.mime_type;
        }
        if (message.type === "sticker") {
          mediaId = message.sticker.id;
          mimeType = message.sticker.mime_type;
        }
        if (!mediaId) continue;

        const isAudioClipInput =
          block?.type === InputBlockType.TEXT &&
          block.options?.audioClip?.isEnabled &&
          message.type === "audio";
        const fileVisibility = isAudioClipInput
          ? block.options?.audioClip?.visibility
          : block?.type === InputBlockType.FILE
            ? block.options?.visibility
            : block?.type === InputBlockType.TEXT
              ? block.options?.attachments?.visibility
              : undefined;
        let fileUrl: string;
        if (fileVisibility !== "Public") {
          const extension = getExtensionFromMimeType(mimeType);
          fileUrl =
            env.NEXTAUTH_URL +
            `/api/typebots/${typebotId}/whatsapp/media/${
              workspaceId ? "" : "preview/"
            }${mediaId}${extension ? `.${extension}` : ""}`;
        } else {
          const { file, mimeType } = await downloadMedia({
            mediaId,
            credentials,
          });
          const extension = getExtensionFromMimeType(mimeType);
          const url = await uploadFileToBucket({
            file,
            key:
              resultId && workspaceId && typebotId
                ? `workspaces/${workspaceId}/typebots/${typebotId}/results/${resultId}/${mediaId}${extension ? `.${extension}` : ""}`
                : `tmp/whatsapp/media/${mediaId}${extension ? `.${extension}` : ""}`,
            mimeType,
          });
          fileUrl = url;
        }
        if (message.type === "audio" && block?.type !== InputBlockType.FILE)
          return {
            type: "audio",
            url: fileUrl,
          };
        if (block?.type === InputBlockType.FILE) {
          append(fileUrl);
        } else if (block?.type === InputBlockType.TEXT) {
          let caption: string | undefined;
          if (message.type === "document" && message.document.caption) {
            const looksLikeFilename = /^[\w,\s-]+\.[A-Za-z0-9]{1,10}$/;
            if (!looksLikeFilename.test(message.document.caption))
              caption = message.document.caption;
          } else if (message.type === "image" && message.image.caption)
            caption = message.image.caption;
          else if (message.type === "video" && message.video.caption)
            caption = message.video.caption;
          if (caption) text = text === "" ? caption : `${text}\n\n${caption}`;
          attachedFileUrls.push(fileUrl);
        }
        break;
      }
      case "location": {
        const location = `${message.location.latitude}, ${message.location.longitude}`;
        append(location);
        break;
      }
      case "webhook": {
        if (!message.webhook.data) return;
        text = message.webhook.data;
      }
    }
  }

  return {
    type: "text",
    text,
    attachedFileUrls,
    metadata: { replyId },
  };
};

const getExtensionFromMimeType = (mimeType: string | undefined) => {
  if (!mimeType) return;
  return extensionFromMimeType[mimeType.split(";")[0].trim().toLowerCase()];
};
