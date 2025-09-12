import type { Descendant, TText } from "../plate";

export const isTextDescendant = (
  descendant: Descendant,
): descendant is TText => {
  return "text" in descendant;
};
