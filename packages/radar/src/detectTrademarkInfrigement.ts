import { env } from "@typebot.io/env";
import type { Settings } from "@typebot.io/settings/schemas";

export const detectTrademarkInfrigement = (
  metadata?: Settings["metadata"],
): string | undefined => {
  if (
    !env.TRADEMARK_VIOLATION_KEYWORDS ||
    (!metadata?.title && !metadata?.description)
  )
    return;
  const keywordDetected = env.TRADEMARK_VIOLATION_KEYWORDS.find((keyword) => {
    const regex = new RegExp(keyword, "i");
    if (metadata.title) {
      if (regex.test(metadata.title)) return keyword;
    }
    if (metadata.description) {
      if (regex.test(metadata.description)) return keyword;
    }
  });
  return keywordDetected;
};
