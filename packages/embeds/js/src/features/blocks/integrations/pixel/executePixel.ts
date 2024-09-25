import { trackPixelEvent } from "@/lib/pixel";
import type { PixelBlock } from "@typebot.io/blocks-integrations/pixel/schema";
import { isEmpty } from "@typebot.io/lib/utils";

export const executePixel = async (options: PixelBlock["options"]) => {
  if (isEmpty(options?.pixelId)) return;
  trackPixelEvent(options);
};
