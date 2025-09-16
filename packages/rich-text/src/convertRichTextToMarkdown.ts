import { createSlateEditor, type Descendant, type Element } from "./plate";
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
  const editor = createSlateEditor({
    plugins: plateCorePlugins,
  });

  return editor.api.markdown
    .serialize({
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
                text: textHandler,
                link: (node, _parent, state, info) => {
                  const text = state.containerPhrasing(node, info);
                  return text ? `${text} (${node.url})` : node.url;
                },
                delete: (node, _parent, state, info) => {
                  const value = state.containerPhrasing(node, info);
                  return `~${value}~`;
                },
                strong: (node, _parent, state, info) => {
                  const value = state.containerPhrasing(node, info);
                  return `*${value}*`;
                },
                mdxJsxTextElement: (node, _parent, state, info) => {
                  return state.containerPhrasing(node, info);
                },
              },
            }
          : {
              handlers: {
                text: textHandler,
                link: (node, _parent, state, info) => {
                  const text = state.containerPhrasing(node, info);
                  return text ? `[${text}](${node.url})` : node.url;
                },
              },
            }),
      },
    })
    .slice(0, -1);
};

// Avoid any sort of escaping or sanitization.
const textHandler = (node: any) => node.value;
