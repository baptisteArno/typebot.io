import type { Descendant } from "@typebot.io/rich-text/plate";

export const computePlainText = (elements: Descendant[]): string =>
  elements
    .map(
      (element) =>
        element.text ?? computePlainText(element.children as Descendant[]),
    )
    .join("");
