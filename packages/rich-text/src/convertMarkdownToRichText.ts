import type { Paragraph, Root, Text } from "mdast";
import type { Plugin } from "unified";
import { createSlateEditor } from "./plate";
import { plateCorePlugins } from "./plateCorePlugins";

export const convertMarkdownToRichText = (data: string) => {
  const editor = createSlateEditor({
    plugins: plateCorePlugins,
  });

  return editor.api.markdown.deserialize(data, {
    remarkPlugins: [remarkPreserveEmptyLines],
  });
};

const remarkPreserveEmptyLines: Plugin = () => (tree) => {
  const children = (tree as Root).children;
  let i = 0;

  while (i < children.length - 1) {
    const a: any = children[i];
    const b: any = children[i + 1];

    // Need line-based positions from remark-parse
    const aPos = a?.position;
    const bPos = b?.position;

    if (aPos?.end?.line != null && bPos?.start?.line != null) {
      // number of completely blank lines between a and b
      const gap = bPos.start.line - aPos.end.line - 1;

      // Insert one empty paragraph per blank line
      for (let k = 0; k < gap; k++) {
        const emptyPara: Paragraph = {
          type: "paragraph",
          children: [{ type: "text", value: "" } as Text],
        };

        children.splice(i + 1, 0, emptyPara);
        i++; // skip over what we just inserted
      }
    }

    i++;
  }
};
