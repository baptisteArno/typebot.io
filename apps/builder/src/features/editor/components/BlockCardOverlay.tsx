import type { BlockV6 } from "@typebot.io/blocks-core/schemas/schema";
import { cn } from "@typebot.io/ui/lib/cn";
import { BlockIcon } from "./BlockIcon";
import { BlockLabel } from "./BlockLabel";

export const BlockCardOverlay = ({
  type,
  className,
  style,
  onMouseUp,
}: {
  type: BlockV6["type"];
  className?: string;
  style?: React.CSSProperties;
  onMouseUp: () => void;
}) => {
  return (
    <div
      className={cn(
        "flex items-center gap-2 border rounded-lg w-[147px] px-4 py-2 shadow-xl cursor-grabbing transition-none pointer-events-none z-10 bg-gray-2",
        className,
      )}
      onMouseUp={onMouseUp}
      style={style}
    >
      <BlockIcon type={type} />
      <BlockLabel type={type} />
    </div>
  );
};
