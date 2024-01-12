import { ResultHeaderCell } from '@typebot.io/schemas'

export const parseColumnsOrder = (
  existingOrder: string[] | undefined,
  resultHeader: ResultHeaderCell[]
) =>
  existingOrder
    ? [
        ...existingOrder.slice(0, -1),
        ...resultHeader
          .filter((header) => !existingOrder.includes(header.id))
          .map((h) => h.id),
        'logs',
      ]
    : ['select', ...resultHeader.map((h) => h.id), 'logs']
