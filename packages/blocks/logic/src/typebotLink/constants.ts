import type { TypebotLinkBlock } from "./schema";

export const defaultTypebotLinkOptions = {
  mergeResults: false,
} as const satisfies TypebotLinkBlock["options"];
