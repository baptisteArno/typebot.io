import type { PixelBlock } from "@typebot.io/blocks-integrations/pixel/schema";
import { cx } from "@typebot.io/ui/lib/cva";

type Props = {
  options: PixelBlock["options"];
};

export const PixelNodeBody = ({ options }: Props) => (
  <p
    className={cx(
      "truncate",
      options?.eventType || options?.pixelId ? "text-gray-12" : "text-gray-9",
    )}
  >
    {options?.eventType
      ? `Track "${options.eventType}"`
      : options?.pixelId
        ? "Init Pixel"
        : "Configure..."}
  </p>
);
