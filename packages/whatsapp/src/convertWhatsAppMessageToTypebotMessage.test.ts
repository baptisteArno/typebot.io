import { InputBlockType } from "@typebot.io/blocks-inputs/constants";
import type { FileInputBlock } from "@typebot.io/blocks-inputs/file/schema";
import type { TextInputBlock } from "@typebot.io/blocks-inputs/text/schema";
import type { WhatsAppCredentials } from "@typebot.io/credentials/schemas";
import { describe, expect, it } from "vitest";
import { convertWhatsAppMessageToTypebotMessage } from "./convertWhatsAppMessageToTypebotMessage";
import type { WhatsAppIncomingMessage } from "./schemas";

const credentials = {
  provider: "meta",
  systemUserAccessToken: "token",
  phoneNumberId: "phone-number-id",
} satisfies WhatsAppCredentials["data"];

describe("convertWhatsAppMessageToTypebotMessage", () => {
  it("converts audio messages to text URLs for file input blocks", async () => {
    const block = {
      id: "file-input",
      type: InputBlockType.FILE,
      options: {
        variableId: "file-variable",
        visibility: "Auto",
      },
    } satisfies FileInputBlock;

    const result = await convertWhatsAppMessageToTypebotMessage({
      messages: [createAudioMessage("audio-media-id")],
      workspaceId: "workspace-id",
      credentials,
      typebotId: "typebot-id",
      resultId: "result-id",
      block,
    });

    expect(result).toEqual({
      type: "text",
      text: "http://localhost:3000/api/typebots/typebot-id/whatsapp/media/audio-media-id.ogg",
      attachedFileUrls: [],
      metadata: { replyId: undefined },
    });
  });

  it("keeps audio messages as audio replies for text input audio clips", async () => {
    const block = {
      id: "text-input",
      type: InputBlockType.TEXT,
      options: {
        audioClip: {
          isEnabled: true,
          saveVariableId: "audio-variable",
          visibility: "Auto",
        },
      },
    } satisfies TextInputBlock;

    const result = await convertWhatsAppMessageToTypebotMessage({
      messages: [createAudioMessage("audio-media-id")],
      workspaceId: "workspace-id",
      credentials,
      typebotId: "typebot-id",
      resultId: "result-id",
      block,
    });

    expect(result).toEqual({
      type: "audio",
      url: "http://localhost:3000/api/typebots/typebot-id/whatsapp/media/audio-media-id.ogg",
    });
  });

  it("keeps audio messages as audio replies for other input blocks", async () => {
    const block = {
      id: "text-input",
      type: InputBlockType.TEXT,
      options: {},
    } satisfies TextInputBlock;

    const result = await convertWhatsAppMessageToTypebotMessage({
      messages: [createAudioMessage("audio-media-id")],
      workspaceId: "workspace-id",
      credentials,
      typebotId: "typebot-id",
      resultId: "result-id",
      block,
    });

    expect(result).toEqual({
      type: "audio",
      url: "http://localhost:3000/api/typebots/typebot-id/whatsapp/media/audio-media-id.ogg",
    });
  });
});

const createAudioMessage = (mediaId: string) =>
  ({
    id: "message-id",
    from: "33612345678",
    timestamp: "1767225600",
    type: "audio",
    audio: {
      id: mediaId,
      mime_type: "audio/ogg",
    },
  }) satisfies WhatsAppIncomingMessage;
