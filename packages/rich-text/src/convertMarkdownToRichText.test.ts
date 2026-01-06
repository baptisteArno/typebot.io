import { describe, expect, it } from "bun:test";
import { convertMarkdownToRichText } from "./convertMarkdownToRichText";

describe("convertMarkdownToRichText", () => {
  it("should convert basic markdown to rich text correctly", () => {
    const markdown = "Hello, world!";
    const richText = convertMarkdownToRichText(markdown);
    expect(richText).toStrictEqual([
      {
        type: "p",
        children: [{ text: "Hello, world!" }],
      },
    ]);
  });

  it("should preserve new lines correctly", () => {
    const markdown = "Hello, world!\n\n\nHello, world!";
    const richText = convertMarkdownToRichText(markdown);
    expect(richText).toStrictEqual([
      {
        type: "p",
        children: [{ text: "Hello, world!" }],
      },
      {
        type: "p",
        children: [
          {
            text: "",
          },
        ],
      },
      {
        type: "p",
        children: [
          {
            text: "",
          },
        ],
      },
      {
        type: "p",
        children: [{ text: "Hello, world!" }],
      },
    ]);

    const markdown2 = "**Bold**\nText";
    const richText2 = convertMarkdownToRichText(markdown2);
    expect(richText2).toStrictEqual([
      {
        type: "p",
        children: [
          {
            bold: true,
            text: "Bold",
          },
          { text: "\nText" },
        ],
      },
    ]);
  });
});
