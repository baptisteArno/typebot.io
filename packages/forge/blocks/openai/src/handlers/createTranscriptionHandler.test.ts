import { describe, expect, it } from "bun:test";
import { createOpenAITranscriptionFileName } from "./createTranscriptionHandler";

describe("createOpenAITranscriptionFileName", () => {
  it("normalizes audio/webm to an OpenAI-supported WebM filename", () => {
    expect(
      createOpenAITranscriptionFileName({
        contentType: "audio/webm",
        url: "https://files.typebot.io/audio.weba",
      }),
    ).toBe("audio.webm");
  });

  it("normalizes existing weba URLs to WebM", () => {
    expect(
      createOpenAITranscriptionFileName({
        url: "https://files.typebot.io/audio.weba",
      }),
    ).toBe("audio.webm");
  });

  it("keeps OpenAI-supported URL extensions", () => {
    expect(
      createOpenAITranscriptionFileName({
        contentType: "application/octet-stream",
        url: "https://files.typebot.io/audio.mp3?token=123",
      }),
    ).toBe("audio.mp3");
  });

  it("falls back to WebM when neither URL nor content type is useful", () => {
    expect(
      createOpenAITranscriptionFileName({
        contentType: "application/octet-stream",
        url: "https://files.typebot.io/audio",
      }),
    ).toBe("audio.webm");
  });
});
