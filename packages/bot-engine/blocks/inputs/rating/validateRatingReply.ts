import { RatingInputBlock } from '@typebot.io/schemas'
import { defaultRatingInputOptions } from '@typebot.io/schemas/features/blocks/inputs/rating/constants'

export const validateRatingReply = (reply: string, block: RatingInputBlock) =>
  Number(reply) <= (block.options?.length ?? defaultRatingInputOptions.length)
