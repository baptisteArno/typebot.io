import { RatingInputBlock } from '@typebot.io/schemas'

export const validateRatingReply = (reply: string, block: RatingInputBlock) =>
  Number(reply) <= block.options.length
