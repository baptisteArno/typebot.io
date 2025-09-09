import type { PixelBlock } from "@typebot.io/blocks-integrations/pixel/schema";
import { isEmpty } from "@typebot.io/lib/utils";
import { trackPixelEvent } from "@/lib/pixel";

export const executePixel = async (options: PixelBlock["options"]) => {
  if (isEmpty(options?.pixelId)) return;
  trackPixelEvent(options);
};
