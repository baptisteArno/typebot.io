import { ResultHeaderCell } from '@typebot.io/schemas'

const fixedPrefix = ['select', '__helpdeskId']
const fixedSuffix = ['__visitedBlocksCount', '__status', 'logs', '__flowReplay']

export const parseColumnsOrder = (
  existingOrder: string[] | undefined,
  resultHeader: ResultHeaderCell[]
) => {
  const dynamicIds = existingOrder
    ? [
        ...existingOrder.filter(
          (id) => !fixedPrefix.includes(id) && !fixedSuffix.includes(id)
        ),
        ...resultHeader
          .filter(
            (header) =>
              !existingOrder.includes(header.id) &&
              !fixedPrefix.includes(header.id) &&
              !fixedSuffix.includes(header.id)
          )
          .map((h) => h.id),
      ]
    : resultHeader.map((h) => h.id)

  return [...fixedPrefix, ...dynamicIds, ...fixedSuffix]
}
