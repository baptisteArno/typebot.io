import type { TDescendant, Value } from "@udecode/plate-common";

import { remarkTextTypes } from "./remarkTextTypes";
import { remarkTransformElement } from "./remarkTransformElement";
import { remarkTransformText } from "./remarkTransformText";
import type { MdastNode, RemarkPluginOptions } from "./types";

export const remarkTransformNode = <V extends Value>(
  node: MdastNode,
  lastLineNumber: number,
  options: RemarkPluginOptions<V>,
): TDescendant | TDescendant[] => {
  const { type } = node;

  if (remarkTextTypes.includes(type!)) {
    return remarkTransformText(node, options);
  }

  return remarkTransformElement(node, lastLineNumber, options);
};
