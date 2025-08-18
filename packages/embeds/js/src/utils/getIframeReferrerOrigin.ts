import { isNotEmpty } from "@typebot.io/lib/utils";

/**
 * Returns the embedding page origin when running inside an iframe.
 *
 * This reads `document.referrer` only when the current window is embedded
 * (i.e., `parent !== window`). If parsing fails or there's no referrer,
 * it returns `undefined`.
 */
export const getIframeReferrerOrigin = (): string | undefined => {
  try {
    if (typeof window === "undefined") return undefined;
    const isEmbedded = parent !== window;
    if (!isEmbedded || !isNotEmpty(document.referrer)) return undefined;
    try {
      return new URL(document.referrer).origin;
    } catch {
      return undefined;
    }
  } catch {
    return undefined;
  }
};
