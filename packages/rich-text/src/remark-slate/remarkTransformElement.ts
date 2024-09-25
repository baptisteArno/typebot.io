import type { TElement, Value } from "@udecode/plate-common";

import type { MdastNode, RemarkPluginOptions } from "./types";

export const remarkTransformElement = <V extends Value>(
  node: MdastNode,
  lastLineNumber: number,
  options: RemarkPluginOptions<V>,
): TElement | TElement[] => {
  const { elementRules } = options;

  const { type } = node;
  const elementRule = (elementRules as any)[type!];
  if (!elementRule) return [];

  return elementRule.transform(node, lastLineNumber, options);
};
