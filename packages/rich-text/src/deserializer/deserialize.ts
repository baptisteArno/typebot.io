import {
  type PlateEditor,
  type Value,
  getPluginOptions,
} from "@udecode/plate-common";
import markdown from "remark-parse";
import { unified } from "unified";

import { KEY_DESERIALIZE_MD } from "../convertMarkdownToRichText";
import { remarkPlugin } from "../remark-slate/remarkPlugin";
import type { RemarkPluginOptions } from "../remark-slate/types";
import type { DeserializeMdPlugin } from "./types";

export const deserialize = <V extends Value>(
  editor: PlateEditor<V>,
  data: string,
) => {
  const { elementRules, textRules, indentList } = getPluginOptions<
    DeserializeMdPlugin,
    V
  >(editor, KEY_DESERIALIZE_MD);

  const tree: any = unified()
    .use(markdown)
    .use(remarkPlugin, {
      editor,
      elementRules,
      textRules,
      indentList,
    } as unknown as RemarkPluginOptions<V>)
    .processSync(data);

  return tree.result;
};
