import { defaultRatingInputOptions } from "@typebot.io/blocks-inputs/rating/constants";
import type { RatingInputBlock } from "@typebot.io/blocks-inputs/rating/schema";

export const validateRatingReply = (reply: string, block: RatingInputBlock) =>
  Number(reply) <= (block.options?.length ?? defaultRatingInputOptions.length);
