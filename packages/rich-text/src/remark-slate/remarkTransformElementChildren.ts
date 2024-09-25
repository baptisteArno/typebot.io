import type { TDescendant, Value } from "@udecode/plate-common";

import { remarkTransformNode } from "./remarkTransformNode";
import type { MdastNode, RemarkPluginOptions } from "./types";

export const remarkTransformElementChildren = <V extends Value>(
  node: MdastNode,
  lastLineNumber: number,
  options: RemarkPluginOptions<V>,
): TDescendant[] => {
  const { children } = node;
  if (!children) return [];

  return children.flatMap((child) =>
    remarkTransformNode(child, lastLineNumber, options),
  );
};
