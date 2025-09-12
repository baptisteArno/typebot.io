import type { Descendant, TElement } from "../plate";

export const isElementDescendant = (
  descendant: Descendant,
): descendant is TElement => {
  return "type" in descendant;
};
