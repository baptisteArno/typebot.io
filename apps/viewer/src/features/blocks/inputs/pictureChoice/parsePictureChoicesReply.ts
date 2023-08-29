import { PictureChoiceBlock, SessionState } from '@typebot.io/schemas'
import { ParsedReply } from '@/features/chat/types'
import { injectVariableValuesInPictureChoiceBlock } from './injectVariableValuesInPictureChoiceBlock'

export const parsePictureChoicesReply =
  (state: SessionState) =>
  (inputValue: string, block: PictureChoiceBlock): ParsedReply => {
    const displayedItems = injectVariableValuesInPictureChoiceBlock(
      state.typebotsQueue[0].typebot.variables
    )(block).items
    if (block.options.isMultipleChoice) {
      const longestItemsFirst = [...displayedItems].sort(
        (a, b) => (b.title?.length ?? 0) - (a.title?.length ?? 0)
      )
      const matchedItemsByContent = longestItemsFirst.reduce<{
        strippedInput: string
        matchedItemIds: string[]
      }>(
        (acc, item) => {
          if (
            item.title &&
            acc.strippedInput.toLowerCase().includes(item.title.toLowerCase())
          )
            return {
              strippedInput: acc.strippedInput.replace(item.title ?? '', ''),
              matchedItemIds: [...acc.matchedItemIds, item.id],
            }
          return acc
        },
        {
          strippedInput: inputValue.trim(),
          matchedItemIds: [],
        }
      )
      const remainingItems = displayedItems.filter(
        (item) => !matchedItemsByContent.matchedItemIds.includes(item.id)
      )
      const matchedItemsByIndex = remainingItems.reduce<{
        strippedInput: string
        matchedItemIds: string[]
      }>(
        (acc, item, idx) => {
          if (acc.strippedInput.includes(`${idx + 1}`))
            return {
              strippedInput: acc.strippedInput.replace(`${idx + 1}`, ''),
              matchedItemIds: [...acc.matchedItemIds, item.id],
            }
          return acc
        },
        {
          strippedInput: matchedItemsByContent.strippedInput,
          matchedItemIds: [],
        }
      )

      const matchedItems = displayedItems.filter((item) =>
        [
          ...matchedItemsByContent.matchedItemIds,
          ...matchedItemsByIndex.matchedItemIds,
        ].includes(item.id)
      )

      if (matchedItems.length === 0) return { status: 'fail' }
      return {
        status: 'success',
        reply: matchedItems
          .map((item) => item.title ?? item.pictureSrc ?? '')
          .join(', '),
      }
    }
    if (state.whatsApp) {
      const matchedItem = displayedItems.find((item) => item.id === inputValue)
      if (!matchedItem) return { status: 'fail' }
      return {
        status: 'success',
        reply: matchedItem.title ?? matchedItem.pictureSrc ?? '',
      }
    }
    const longestItemsFirst = [...displayedItems].sort(
      (a, b) => (b.title?.length ?? 0) - (a.title?.length ?? 0)
    )
    const matchedItem = longestItemsFirst.find(
      (item) =>
        item.title &&
        item.title
          .toLowerCase()
          .trim()
          .includes(inputValue.toLowerCase().trim())
    )
    if (!matchedItem) return { status: 'fail' }
    return {
      status: 'success',
      reply: matchedItem.title ?? matchedItem.pictureSrc ?? '',
    }
  }
