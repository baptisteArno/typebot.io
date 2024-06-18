import { RatingInputBlock } from '@sniper.io/schemas'
import { defaultRatingInputOptions } from '@sniper.io/schemas/features/blocks/inputs/rating/constants'

export const validateRatingReply = (reply: string, block: RatingInputBlock) =>
  Number(reply) <= (block.options?.length ?? defaultRatingInputOptions.length)
