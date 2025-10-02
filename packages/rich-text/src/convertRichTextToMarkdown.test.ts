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
        children: [
          {
            text: "1) ",
          },
          {
            bold: true,
            text: "Hello world <3",
          },
        ],
      },
    ];
    const markdown = convertRichTextToMarkdown(richText);
    expect(markdown).toBe("1) **Hello world <3**");
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
        children: [
          {
            children: [
              {
                children: [
                  {
                    text: "One",
                  },
                ],
                type: "lic",
              },
            ],
            type: "li",
          },
          {
            children: [
              {
                children: [
                  {
                    text: "Two",
                  },
                ],
                type: "lic",
              },
            ],
            type: "li",
          },
        ],
        type: "ol",
      },
      {
        children: [
          {
            children: [
              {
                children: [
                  {
                    text: "One",
                  },
                ],
                type: "lic",
              },
            ],
            type: "li",
          },
        ],
        type: "ul",
      },
      {
        type: "p",
        children: [{ text: "italic", italic: true }],
      },
      {
        type: "p",
        children: [{ text: "underlined", underline: true }],
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
    expect(markdown).toBe(
      "*bold*\n\n1. One\n2. Two\n\n* One\n_italic_\nunderlined",
    );
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
      variables: [
        {
          id: "1",
          name: "URL",
          value: "https://example.com?test=test&val=val",
        },
      ],
      sessionStore: new SessionStore(),
      takeLatestIfList: false,
    });
    const markdown = convertRichTextToMarkdown(parsedRichText.parsedElements);
    expect(markdown).toBe(
      "Welcome to **AA** (Awesome Agency)\n\nhttps://example.com?test=test&val=val\n\n[Yo](https://example.com?test=test&val=val)",
    );
  });
});
