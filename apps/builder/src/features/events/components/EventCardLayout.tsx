import type { TDraggableEvent, TEvent } from "@typebot.io/events/schemas";
import { Tooltip } from "@typebot.io/ui/components/Tooltip";
import { cx } from "@typebot.io/ui/lib/cva";
import { useEffect, useState } from "react";
import { useBlockDnd } from "@/features/graph/providers/GraphDndProvider";

type Props = {
  type: TEvent["type"];
  tooltip?: string;
  isDisabled?: boolean;
  children: React.ReactNode;
  onPointerDown: (e: React.PointerEvent, type: TDraggableEvent["type"]) => void;
};

export const EventCardLayout = ({
  type,
  onPointerDown,
  tooltip,
  isDisabled,
  children,
}: Props) => {
  const { draggedEventType } = useBlockDnd();
  const [isPointerDown, setIsPointerDown] = useState(false);

  useEffect(() => {
    setIsPointerDown(draggedEventType === type);
  }, [draggedEventType, type]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isDisabled) return;
    onPointerDown(e, type as TDraggableEvent["type"]);
  };

  return (
    <Tooltip.Root disabled={!tooltip}>
      <Tooltip.Trigger
        render={
          <div className="flex relative">
            <button
              type="button"
              disabled={isDisabled}
              className={cx(
                "flex items-center gap-2 border rounded-lg flex-1 px-4 py-2 touch-pan-y bg-gray-1 transition-[box-shadow,background-color]",
                isPointerDown ? "min-h-[42px]" : undefined,
                isDisabled
                  ? "cursor-not-allowed"
                  : "cursor-grab hover:shadow-md",
                isPointerDown || isDisabled ? "opacity-40" : "opacity-100",
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
