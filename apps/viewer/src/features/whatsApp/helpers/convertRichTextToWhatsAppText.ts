import { TElement } from '@udecode/plate-common'
import { serialize } from 'remark-slate'

export const convertRichTextToWhatsAppText = (richText: TElement[]): string =>
  richText
    .map((chunk) =>
      serialize(chunk)?.replaceAll('**', '*').replaceAll('&amp;#39;', "'")
    )
    .join('')
