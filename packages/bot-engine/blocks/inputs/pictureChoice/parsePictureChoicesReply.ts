import { PictureChoiceBlock, SessionState } from '@typebot.io/schemas'
import { ParsedReply } from '../../../types'
import { injectVariableValuesInPictureChoiceBlock } from './injectVariableValuesInPictureChoiceBlock'
import { isNotEmpty } from '@typebot.io/lib/utils'

export const parsePictureChoicesReply =
  (state: SessionState) =>
  (inputValue: string, block: PictureChoiceBlock): ParsedReply => {
    const displayedItems = injectVariableValuesInPictureChoiceBlock(
      state.typebotsQueue[0].typebot.variables
    )(block).items
    if (block.options?.isMultipleChoice) {
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
          .map((item) =>
            isNotEmpty(item.title) ? item.title : item.pictureSrc ?? ''
          )
          .join(', '),
      }
    }
    const longestItemsFirst = [...displayedItems].sort(
      (a, b) => (b.title?.length ?? 0) - (a.title?.length ?? 0)
    )
    const matchedItem = longestItemsFirst.find(
      (item) =>
        item.id === inputValue ||
        item.title?.toLowerCase().trim() === inputValue.toLowerCase().trim() ||
        item.pictureSrc?.toLowerCase().trim() ===
          inputValue.toLowerCase().trim()
    )
    if (!matchedItem) return { status: 'fail' }
    return {
      status: 'success',
      reply: isNotEmpty(matchedItem.title)
        ? matchedItem.title
        : matchedItem.pictureSrc ?? '',
    }
  }
