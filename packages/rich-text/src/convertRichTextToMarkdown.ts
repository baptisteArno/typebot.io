import type { TElement } from "@udecode/plate-common";
import { defaultNodeTypes } from "./serializer/ast-types";
import serialize from "./serializer/serialize";

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
            const serializedElement = serialize(node, {
              nodeTypes: defaultNodeTypes,
              flavour: options?.flavour,
            }) as string;
            if (!serializedElement || serializedElement === "<br>\n\n")
              return [...acc, "\n"];
            return [...acc, serializedElement];
          }, []),
        ];
      }
      const serializedElement = serialize(node, {
        nodeTypes: defaultNodeTypes,
        flavour: options?.flavour,
      });
      if (!serializedElement || serializedElement === "<br>\n\n")
        return [...acc, "\n"];
      return [...acc, serializedElement];
    }, [])
    .join("");

  return test.endsWith("\n") ? test.slice(0, -1) : test;
};
