import { describe, expect, it } from "bun:test";
import { InputBlockType } from "@typebot.io/blocks-inputs/constants";
import type { InputBlock } from "@typebot.io/blocks-inputs/schema";
import { SessionStore } from "@typebot.io/runtime-session-store";
import { validateAndParseInputMessage } from "./validateAndParseInputMessage";

describe("validateAndParseInputMessage", () => {
  it("prefers structured attached file URLs for file inputs", () => {
    const block = {
      id: "file-input",
      type: InputBlockType.FILE,
      options: {
        isMultipleAllowed: true,
      },
    } satisfies InputBlock;

    const result = validateAndParseInputMessage(
      {
        type: "text",
        text: "",
        attachedFileUrls: [
          "https://files.example.com/audio-media-id.ogg",
          "https://files.example.com/second-audio-media-id.ogg",
        ],
      },
      {
        block,
        sessionStore: new SessionStore(),
        variables: [],
      },
    );

    expect(result).toEqual({
      status: "success",
      content:
        "https://files.example.com/audio-media-id.ogg, https://files.example.com/second-audio-media-id.ogg",
      attachedFileUrls: [
        "https://files.example.com/audio-media-id.ogg",
        "https://files.example.com/second-audio-media-id.ogg",
      ],
    });
  });

  it("preserves commas inside file input text URLs", () => {
    const block = {
      id: "file-input",
      type: InputBlockType.FILE,
    } satisfies InputBlock;

    const result = validateAndParseInputMessage(
      {
        type: "text",
        text: "https://files.example.com/a,b.pdf",
      },
      {
        block,
        sessionStore: new SessionStore(),
        variables: [],
      },
    );

    expect(result).toEqual({
      status: "success",
      content: "https://files.example.com/a,b.pdf",
    });
  });

  it("only keeps the first structured attachment for single file inputs", () => {
    const block = {
      id: "file-input",
      type: InputBlockType.FILE,
    } satisfies InputBlock;

    const result = validateAndParseInputMessage(
      {
        type: "text",
        text: "",
        attachedFileUrls: [
          "https://files.example.com/audio-media-id.ogg",
          "https://files.example.com/second-audio-media-id.ogg",
        ],
      },
      {
        block,
        sessionStore: new SessionStore(),
        variables: [],
      },
    );

    expect(result).toEqual({
      status: "success",
      content: "https://files.example.com/audio-media-id.ogg",
      attachedFileUrls: ["https://files.example.com/audio-media-id.ogg"],
    });
  });
});
