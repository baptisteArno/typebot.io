import { SessionStore } from "@typebot.io/runtime-session-store";
import type { TElement } from "platejs";
import { describe, expect, it } from "vitest";
import { convertRichTextToMarkdown } from "./convertRichTextToMarkdown";
import { parseVariablesInRichText } from "./parseVariablesInRichText";

describe("convertRichTextToMarkdown", () => {
  it("should convert basic rich text to markdown correctly", () => {
    const richText: TElement[] = [
      {
        type: "p",
        children: [{ text: "Hello, world!" }],
      },
    ];
    const markdown = convertRichTextToMarkdown(richText);
    expect(markdown).toBe("Hello, world!");
  });

  it("should convert new lines correctly", () => {
    const richText: TElement[] = [
      {
        type: "p",
        children: [{ text: "Hello" }],
      },
      {
        type: "p",
        children: [{ text: "" }],
      },
      {
        type: "p",
        children: [{ text: "World" }],
      },
    ];
    const markdown = convertRichTextToMarkdown(richText);
    expect(markdown).toBe("Hello\n\nWorld");
  });

  it("should convert rich text with inline variable to markdown correctly", () => {
    const richText: TElement[] = [
      {
        type: "p",
        children: [{ text: "Hello {{Name}}!" }],
      },
    ];

    const parsedRichText = parseVariablesInRichText(richText, {
      variables: [{ id: "1", name: "Name", value: "John" }],
      sessionStore: new SessionStore(),
      takeLatestIfList: false,
    });
    const markdown = convertRichTextToMarkdown(parsedRichText.parsedElements);
    expect(markdown).toBe("Hello John!");

    const parsedRichText2 = parseVariablesInRichText(richText, {
      variables: [
        { id: "1", name: "Name", value: "Multiline\n\nvariable\n**value**" },
      ],
      sessionStore: new SessionStore(),
      takeLatestIfList: false,
    });
    const markdown2 = convertRichTextToMarkdown(parsedRichText2.parsedElements);
    expect(markdown2).toBe("Hello Multiline\n\nvariable\n**value**!");
  });

  it("should convert rich text with single variable correctly", () => {
    const richText: TElement[] = [
      {
        type: "p",
        children: [{ text: "{{Content}}" }],
      },
    ];
    const parsedRichText = parseVariablesInRichText(richText, {
      variables: [
        {
          id: "1",
          name: "Content",
          value: "Hello World\n\n**valid markdown here**",
        },
      ],
      sessionStore: new SessionStore(),
      takeLatestIfList: false,
    });
    const markdown = convertRichTextToMarkdown(parsedRichText.parsedElements);
    expect(markdown).toBe("Hello World\n\n**valid markdown here**");
  });

  it("should convert to WhatsApp syntax correctly", () => {
    const richText: TElement[] = [
      {
        type: "p",
        children: [{ text: "bold", bold: true }],
      },
      {
        type: "p",
        children: [{ text: "" }],
      },
      {
        type: "p",
        children: [{ text: "italic", italic: true }],
      },
    ];
    const parsedRichText = parseVariablesInRichText(richText, {
      variables: [],
      sessionStore: new SessionStore(),
      takeLatestIfList: false,
    });
    const markdown = convertRichTextToMarkdown(parsedRichText.parsedElements, {
      flavour: "whatsapp",
    });
    expect(markdown).toBe("*bold*\n\n_italic_");
  });

  it("should convert variable link correctly", () => {
    const richText: TElement[] = [
      {
        type: "p",
        children: [
          { text: "Welcome to " },
          { bold: true, text: "AA" },
          { text: " (Awesome Agency)" },
        ],
      },
      { children: [{ text: "" }], type: "p" },
      {
        children: [{ text: "{{URL}}" }],
        type: "p",
      },
      { children: [{ text: "" }], type: "p" },
      {
        children: [
          { text: "" },
          {
            children: [{ text: "Yo" }],
            type: "a",
            url: "{{URL}}",
          },
          { text: "" },
        ],
        type: "p",
      },
    ];
    const parsedRichText = parseVariablesInRichText(richText, {
      variables: [{ id: "1", name: "URL", value: "https://example.com" }],
      sessionStore: new SessionStore(),
      takeLatestIfList: false,
    });
    const markdown = convertRichTextToMarkdown(parsedRichText.parsedElements);
    expect(markdown).toBe(
      "Welcome to **AA** (Awesome Agency)\n\nhttps://example.com\n\n[Yo](https://example.com)",
    );
  });
});
