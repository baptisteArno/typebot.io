import type { Value } from "@udecode/plate-common";

import { remarkTransformNode } from "./remarkTransformNode";
import type { MdastNode, RemarkPluginOptions } from "./types";

export function remarkPlugin<V extends Value>(options: RemarkPluginOptions<V>) {
  let lastLineNumber = 1;
  const compiler = (node: { children: Array<MdastNode> }) => {
    return node.children.flatMap((child) => {
      const parsedChild = remarkTransformNode(child, lastLineNumber, options);
      lastLineNumber = child.position?.end.line || lastLineNumber;
      return parsedChild;
    });
  };

  // @ts-ignore
  this.Compiler = compiler;
}
