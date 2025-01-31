import type { TElement, TText } from "@udecode/plate-common";
import { defaultNodeTypes } from "./serializer/ast-types";
import serialize from "./serializer/serialize";

const serializeNode = (
  acc: string[],
  node: TElement | TText,
  options?: { flavour?: "common" | "whatsapp" },
) => {
  const serializedElement = serialize(node, {
    nodeTypes: defaultNodeTypes,
    flavour: options?.flavour,
  });
  if (!serializedElement || serializedElement === "<br>\n\n") {
    return [...acc, "\n"];
  }
  return [...acc, serializedElement];
};

export const convertRichTextToMarkdown = (
  richText: TElement[],
  options?: { flavour?: "common" | "whatsapp" },
) => {
  const test = richText
    .reduce<string[]>((acc, node) => {
      if (node.type === "variable") {
        return [
          ...acc,
          ...node.children.reduce<string[]>((acc, node) => {
            return serializeNode(acc, node, options);
          }, []),
        ];
      }
      return serializeNode(acc, node, options);
    }, [])
    .join("");

  return test.endsWith("\n") ? test.slice(0, -1) : test;
};
