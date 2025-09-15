import type { Descendant, Element } from "platejs";
import { createPlateEditor } from "platejs/react";
import { renderMarkdownForApi } from "./helpers/renderMarkdownForApi";
import { plateCorePlugins } from "./plateCorePlugins";

type Options = {
  flavour?: "commonmark" | "whatsapp";
};

const defaultOptions = {
  flavour: "commonmark",
} as const satisfies Options;

export const convertRichTextToMarkdown = (
  richText: Element[] | Descendant[],
  { flavour = defaultOptions.flavour }: Options = defaultOptions,
) => {
  const editor = createPlateEditor({
    plugins: plateCorePlugins,
  });

  return renderMarkdownForApi(
    editor.api.markdown.serialize({
      value: richText,
      preserveEmptyParagraphs: false,
      remarkStringifyOptions: {
        join: [
          (left, right) => {
            // This is because currently every new line in a text bubble is represented by an empty paragraph node.
            if (
              (left.type as string) === "paragraph" ||
              (right.type as string) === "paragraph"
            )
              return 0;
            return 1;
          },
        ],
        ...(flavour === "whatsapp"
          ? {
              handlers: {
                delete: (node, _parent, state, info) => {
                  const value = state.containerPhrasing(node, info);
                  return `~${value}~`;
                },
                strong: (node, _parent, state, info) => {
                  const value = state.containerPhrasing(node, info);
                  return `*${value}*`;
                },
              },
            }
          : {}),
      },
    }),
  );
};
