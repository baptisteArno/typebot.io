import { BubbleBlockType } from "@typebot.io/blocks-bubbles/constants";
import type { ContinueChatResponse } from "@typebot.io/chat-api/schemas";
import { describe, expect, it } from "vitest";
import { convertMessageToWhatsAppMessage } from "./convertMessageToWhatsAppMessage";

const embedMessage = (url: string): ContinueChatResponse["messages"][number] =>
  ({
    type: BubbleBlockType.EMBED,
    content: { url },
  }) as ContinueChatResponse["messages"][number];

describe("convertMessageToWhatsAppMessage - Embed", () => {
  it("should send a known document extension as a downloadable document", async () => {
    const result = await convertMessageToWhatsAppMessage({
      message: embedMessage("https://example.com/files/report.pdf"),
    });
    expect(result).toEqual({
      type: "document",
      document: {
        link: "https://example.com/files/report.pdf",
        filename: "report.pdf",
      },
    });
  });

  it("should send an unlisted file extension as a downloadable document", async () => {
    const result = await convertMessageToWhatsAppMessage({
      message: embedMessage("https://example.com/files/data.csv"),
    });
    expect(result).toEqual({
      type: "document",
      document: {
        link: "https://example.com/files/data.csv",
        filename: "data.csv",
      },
    });
  });

  it("should strip query params before extracting the extension", async () => {
    const result = await convertMessageToWhatsAppMessage({
      message: embedMessage(
        "https://example.com/files/data.csv?token=abc&expires=123",
      ),
    });
    expect(result).toEqual({
      type: "document",
      document: {
        link: "https://example.com/files/data.csv?token=abc&expires=123",
        filename: "data.csv",
      },
    });
  });

  it("should not treat an image extension as a document", async () => {
    const result = await convertMessageToWhatsAppMessage({
      message: embedMessage("https://example.com/files/photo.png"),
    });
    expect(result).toEqual({
      type: "text",
      text: {
        body: "https://example.com/files/photo.png",
        preview_url: true,
      },
    });
  });

  it("should not mistake a bare domain for a filename", async () => {
    const result = await convertMessageToWhatsAppMessage({
      message: embedMessage("https://example.com"),
    });
    expect(result).toEqual({
      type: "text",
      text: {
        body: "https://example.com",
        preview_url: true,
      },
    });
  });

  it("should treat a path with no dot as a plain link", async () => {
    const result = await convertMessageToWhatsAppMessage({
      message: embedMessage("https://example.com/some/page"),
    });
    expect(result).toEqual({
      type: "text",
      text: {
        body: "https://example.com/some/page",
        preview_url: true,
      },
    });
  });

  it("should return null when there is no url", async () => {
    const result = await convertMessageToWhatsAppMessage({
      message: embedMessage(""),
    });
    expect(result).toBeNull();
  });
});
