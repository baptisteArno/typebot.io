import type {
  BlockIndices,
  BlockV6,
} from "@typebot.io/blocks-core/schemas/schema";
import { cn } from "@typebot.io/ui/lib/cn";
import { BlockIcon } from "@/features/editor/components/BlockIcon";
import { BlockNodeContent } from "./BlockNodeContent";

export const BlockNodeOverlay = ({
  block,
  indices,
  className,
  style,
}: {
  block: BlockV6;
  indices: BlockIndices;
  className?: string;
  style?: React.CSSProperties;
}) => {
  return (
    <div
      className={cn(
        "flex items-center gap-2 p-3 border rounded-lg w-[264px] shadow-md bg-gray-1 cursor-grab pointer-events-none",
        className,
      )}
      style={style}
    >
      <BlockIcon type={block.type} />
      <BlockNodeContent block={block} indices={indices} groupId="" />
    </div>
  );
};
