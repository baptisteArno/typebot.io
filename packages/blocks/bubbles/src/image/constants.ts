import type { ImageBubbleBlock } from "./schema";

export const defaultImageBubbleContent = {
  clickLink: {
    alt: "Bubble image",
  },
} as const satisfies ImageBubbleBlock["content"];
