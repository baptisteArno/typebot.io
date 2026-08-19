import type { BlockV6 } from "@typebot.io/blocks-core/schemas/schema";
import { Tooltip } from "@typebot.io/ui/components/Tooltip";
import { cx } from "@typebot.io/ui/lib/cva";
import { useEffect, useState } from "react";
import { useBlockDnd } from "@/features/graph/providers/GraphDndProvider";

type Props = {
  type: BlockV6["type"];
  tooltip?: string;
  isDisabled?: boolean;
  children: React.ReactNode;
  onPointerDown: (e: React.PointerEvent, type: BlockV6["type"]) => void;
};

export const BlockCardLayout = ({
  type,
  onPointerDown,
  tooltip,
  children,
}: Props) => {
  const { draggedBlockType } = useBlockDnd();
  const [isPointerDown, setIsPointerDown] = useState(false);

  useEffect(() => {
    setIsPointerDown(draggedBlockType === type);
  }, [draggedBlockType, type]);

  const handlePointerDown = (e: React.PointerEvent) => onPointerDown(e, type);

  return (
    <Tooltip.Root disabled={!tooltip}>
      <Tooltip.Trigger
        render={
          <div className="flex relative">
            <button
              type="button"
              className={cx(
                "flex items-center gap-2 border dark:border-gray-3 rounded-lg flex-1 px-4 py-2 cursor-grab touch-pan-y bg-gray-2 hover:shadow-md dark:hover:bg-gray-3 dark:hover:shadow-none transition-[box-shadow,background-color]",
                isPointerDown ? "opacity-40 min-h-[42px]" : "opacity-100",
              )}
              onPointerDown={handlePointerDown}
            >
              {!isPointerDown ? children : null}
            </button>
          </div>
        }
      />
      <Tooltip.Popup>{tooltip}</Tooltip.Popup>
    </Tooltip.Root>
  );
};
