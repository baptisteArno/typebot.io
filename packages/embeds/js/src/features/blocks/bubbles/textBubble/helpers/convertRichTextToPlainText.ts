import type { TDescendant } from '@udecode/plate-common'

export const computePlainText = (elements: TDescendant[]): string =>
  elements
    .map(
      (element) =>
        element.text ?? computePlainText(element.children as TDescendant[])
    )
    .join('')
