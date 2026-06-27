import { InputBlockType } from "@typebot.io/blocks-inputs/constants";
import type { FileInputBlock } from "@typebot.io/blocks-inputs/file/schema";
import type { TextInputBlock } from "@typebot.io/blocks-inputs/text/schema";
import type { WhatsAppCredentials } from "@typebot.io/credentials/schemas";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { convertWhatsAppMessageToTypebotMessage } from "./convertWhatsAppMessageToTypebotMessage";
import type { WhatsAppIncomingMessage } from "./schemas";

const mocks = vi.hoisted(() => ({
  downloadMedia: vi.fn(),
  uploadFileToBucket: vi.fn(
    ({ key }: { key: string }) => `https://s3.typebot.test/public/${key}`,
  ),
}));

vi.mock("./downloadMedia", () => ({
  downloadMedia: mocks.downloadMedia,
}));

vi.mock("@typebot.io/lib/s3/uploadFileToBucket", () => ({
  uploadFileToBucket: mocks.uploadFileToBucket,
}));

const credentials = {
  provider: "meta",
  systemUserAccessToken: "token",
  phoneNumberId: "phone-number-id",
} satisfies WhatsAppCredentials["data"];

describe("convertWhatsAppMessageToTypebotMessage", () => {
  beforeEach(() => {
    mocks.downloadMedia.mockResolvedValue({
      file: Buffer.from("audio"),
      mimeType: "audio/ogg",
    });
    mocks.uploadFileToBucket.mockClear();
  });

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

  it("keeps usable audio URLs when no current block is provided", async () => {
    const result = await convertWhatsAppMessageToTypebotMessage({
      messages: [createAudioMessage("audio-media-id")],
      workspaceId: "workspace-id",
      credentials,
      typebotId: "typebot-id",
      resultId: "result-id",
    });

    expect(result).toEqual({
      type: "audio",
      url: "http://localhost:3000/api/typebots/typebot-id/whatsapp/media/audio-media-id.ogg",
    });
  });

  it("uses the base MIME type to derive the proxied audio extension", async () => {
    const block = {
      id: "file-input",
      type: InputBlockType.FILE,
      options: {
        variableId: "file-variable",
        visibility: "Auto",
      },
    } satisfies FileInputBlock;

    const result = await convertWhatsAppMessageToTypebotMessage({
      messages: [
        createAudioMessage("audio-media-id", "audio/ogg; codecs=opus"),
      ],
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

  it("stores public file input media under a single public prefix", async () => {
    const block = {
      id: "file-input",
      type: InputBlockType.FILE,
      options: {
        variableId: "file-variable",
        visibility: "Public",
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
      text: "https://s3.typebot.test/public/workspaces/workspace-id/typebots/typebot-id/results/result-id/audio-media-id.ogg",
      attachedFileUrls: [],
      metadata: { replyId: undefined },
    });
    expect(mocks.uploadFileToBucket).toHaveBeenCalledWith({
      file: Buffer.from("audio"),
      key: "workspaces/workspace-id/typebots/typebot-id/results/result-id/audio-media-id.ogg",
      mimeType: "audio/ogg",
    });
  });
});

const createAudioMessage = (mediaId: string, mimeType = "audio/ogg") =>
  ({
    id: "message-id",
    from: "33612345678",
    timestamp: "1767225600",
    type: "audio",
    audio: {
      id: mediaId,
      mime_type: mimeType,
    },
  }) satisfies WhatsAppIncomingMessage;
