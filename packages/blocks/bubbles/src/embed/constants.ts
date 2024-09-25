import type { EmbedBubbleBlock } from "./schema";

export const defaultEmbedBubbleContent = {
  height: 400,
} as const satisfies EmbedBubbleBlock["content"];
