import type { Block } from "@typebot.io/blocks-core/schemas/schema";
import { InputBlockType } from "@typebot.io/blocks-inputs/constants";
import type { WhatsAppCredentials } from "@typebot.io/credentials/schemas";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  convertWhatsAppMessageToTypebotMessage,
  getIncomingMediaReplyTarget,
  shouldAggregateIncomingMediaMessages,
} from "./resumeWhatsAppFlow";
import type { WhatsAppIncomingMessage } from "./schemas";

const mocks = vi.hoisted(() => ({
  downloadMedia: vi.fn(),
  uploadFileToBucket: vi.fn(),
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

const audioMessage = {
  from: "33612345678",
  id: "whatsapp-message-id",
  timestamp: "1710000000",
  type: "audio",
  audio: {
    id: "audio-media-id",
    mime_type: "audio/ogg",
  },
} satisfies WhatsAppIncomingMessage;

const secondAudioMessage = {
  ...audioMessage,
  id: "second-whatsapp-message-id",
  audio: {
    id: "second-audio-media-id",
    mime_type: "audio/ogg",
  },
} satisfies WhatsAppIncomingMessage;

const fileInputBlock = {
  id: "file-input",
  type: InputBlockType.FILE,
  options: {
    variableId: "file-variable-id",
    visibility: "Public",
  },
} satisfies Block;

const textInputWithAudioClipBlock = {
  id: "text-input",
  type: InputBlockType.TEXT,
  options: {
    audioClip: {
      isEnabled: true,
      visibility: "Public",
    },
  },
} satisfies Block;

const textInputWithPrivateAudioClipBlock = {
  id: "text-input",
  type: InputBlockType.TEXT,
  options: {
    audioClip: {
      isEnabled: true,
    },
  },
} satisfies Block;

const textInputWithAttachmentsBlock = {
  id: "text-input",
  type: InputBlockType.TEXT,
  options: {
    attachments: {
      isEnabled: true,
      visibility: "Public",
    },
  },
} satisfies Block;

describe("getIncomingMediaReplyTarget", () => {
  it("routes WhatsApp audio from file inputs to the file upload path", () => {
    expect(
      getIncomingMediaReplyTarget({
        block: fileInputBlock,
        messageType: "audio",
      }),
    ).toEqual({ kind: "fileInput", visibility: "Public" });
  });

  it("routes WhatsApp audio from text inputs to audio clips when enabled", () => {
    expect(
      getIncomingMediaReplyTarget({
        block: textInputWithAudioClipBlock,
        messageType: "audio",
      }),
    ).toEqual({ kind: "audioClip", visibility: "Public" });
  });

  it("routes WhatsApp audio from text inputs to attachments when only attachments are enabled", () => {
    expect(
      getIncomingMediaReplyTarget({
        block: textInputWithAttachmentsBlock,
        messageType: "audio",
      }),
    ).toEqual({ kind: "textAttachment", visibility: "Public" });
  });
});

describe("shouldAggregateIncomingMediaMessages", () => {
  it("aggregates WhatsApp audio only when the current input will keep it as uploaded media", () => {
    expect(
      shouldAggregateIncomingMediaMessages({
        block: fileInputBlock,
        messageType: "audio",
      }),
    ).toBe(true);
    expect(
      shouldAggregateIncomingMediaMessages({
        block: textInputWithAttachmentsBlock,
        messageType: "audio",
      }),
    ).toBe(true);
    expect(
      shouldAggregateIncomingMediaMessages({
        block: textInputWithAudioClipBlock,
        messageType: "audio",
      }),
    ).toBe(false);
  });

  it("aggregates all non-audio WhatsApp media types", () => {
    expect(
      shouldAggregateIncomingMediaMessages({
        messageType: "document",
      }),
    ).toBe(true);
    expect(
      shouldAggregateIncomingMediaMessages({
        messageType: "image",
      }),
    ).toBe(true);
    expect(
      shouldAggregateIncomingMediaMessages({
        messageType: "sticker",
      }),
    ).toBe(true);
    expect(
      shouldAggregateIncomingMediaMessages({
        messageType: "video",
      }),
    ).toBe(true);
  });
});

describe("convertWhatsAppMessageToTypebotMessage", () => {
  beforeEach(() => {
    mocks.downloadMedia.mockReset();
    mocks.uploadFileToBucket.mockReset();
    mocks.downloadMedia.mockResolvedValue({
      file: Buffer.from("audio"),
      mimeType: "audio/ogg",
    });
    mocks.uploadFileToBucket.mockResolvedValue(
      "https://files.example.com/audio-media-id.ogg",
    );
  });

  it("converts WhatsApp audio to a public file URL for file upload inputs", async () => {
    const result = await convertWhatsAppMessageToTypebotMessage({
      messages: [audioMessage],
      credentials,
      workspaceId: "workspace-id",
      typebotId: "typebot-id",
      resultId: "result-id",
      block: fileInputBlock,
    });

    expect(result).toEqual({
      type: "text",
      text: "",
      attachedFileUrls: ["https://files.example.com/audio-media-id.ogg"],
      metadata: { replyId: undefined },
    });
    expect(mocks.uploadFileToBucket).toHaveBeenCalledWith({
      file: Buffer.from("audio"),
      key: "public/workspaces/workspace-id/typebots/typebot-id/results/result-id/audio-media-id.ogg",
      mimeType: "audio/ogg",
    });
  });

  it("keeps multiple WhatsApp audio uploads as structured file URLs for file upload inputs", async () => {
    mocks.uploadFileToBucket
      .mockResolvedValueOnce("https://files.example.com/audio-media-id.ogg")
      .mockResolvedValueOnce(
        "https://files.example.com/second-audio-media-id.ogg",
      );

    const result = await convertWhatsAppMessageToTypebotMessage({
      messages: [audioMessage, secondAudioMessage],
      credentials,
      workspaceId: "workspace-id",
      typebotId: "typebot-id",
      resultId: "result-id",
      block: fileInputBlock,
    });

    expect(result).toEqual({
      type: "text",
      text: "",
      attachedFileUrls: [
        "https://files.example.com/audio-media-id.ogg",
        "https://files.example.com/second-audio-media-id.ogg",
      ],
      metadata: { replyId: undefined },
    });
  });

  it("keeps WhatsApp audio as an audio reply for text inputs allowing audio clips", async () => {
    const result = await convertWhatsAppMessageToTypebotMessage({
      messages: [audioMessage],
      credentials,
      workspaceId: "workspace-id",
      typebotId: "typebot-id",
      resultId: "result-id",
      block: textInputWithAudioClipBlock,
    });

    expect(result).toEqual({
      type: "audio",
      url: "https://files.example.com/audio-media-id.ogg",
    });
  });

  it("builds private WhatsApp audio clip URLs with the provided typebot id", async () => {
    const result = await convertWhatsAppMessageToTypebotMessage({
      messages: [audioMessage],
      credentials,
      workspaceId: "workspace-id",
      typebotId: "typebot-id",
      resultId: "result-id",
      block: textInputWithPrivateAudioClipBlock,
    });

    expect(result).toEqual({
      type: "audio",
      url: expect.stringContaining(
        "/api/typebots/typebot-id/whatsapp/media/audio-media-id.ogg",
      ),
    });
    expect(mocks.downloadMedia).not.toHaveBeenCalled();
    expect(mocks.uploadFileToBucket).not.toHaveBeenCalled();
  });

  it("uploads private WhatsApp audio clips when no typebot id is available", async () => {
    mocks.uploadFileToBucket.mockResolvedValue(
      "https://app.example.com/api/s3/private/tmp/whatsapp/media/audio-media-id.ogg",
    );

    const result = await convertWhatsAppMessageToTypebotMessage({
      messages: [audioMessage],
      credentials,
      workspaceId: "workspace-id",
      block: textInputWithPrivateAudioClipBlock,
    });

    expect(result).toEqual({
      type: "audio",
      url: "https://app.example.com/api/s3/private/tmp/whatsapp/media/audio-media-id.ogg",
    });
    expect(mocks.uploadFileToBucket).toHaveBeenCalledWith({
      file: Buffer.from("audio"),
      key: "tmp/whatsapp/media/audio-media-id.ogg",
      mimeType: "audio/ogg",
      visibility: "private",
    });
  });

  it("converts WhatsApp audio to an attachment for text inputs allowing attachments", async () => {
    const result = await convertWhatsAppMessageToTypebotMessage({
      messages: [audioMessage],
      credentials,
      workspaceId: "workspace-id",
      typebotId: "typebot-id",
      resultId: "result-id",
      block: textInputWithAttachmentsBlock,
    });

    expect(result).toEqual({
      type: "text",
      text: "",
      attachedFileUrls: ["https://files.example.com/audio-media-id.ogg"],
      metadata: { replyId: undefined },
    });
  });
});
