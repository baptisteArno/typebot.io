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
  onMouseDown: (e: React.MouseEvent, type: TDraggableEvent["type"]) => void;
};

export const EventCardLayout = ({
  type,
  onMouseDown,
  tooltip,
  isDisabled,
  children,
}: Props) => {
  const { draggedEventType } = useBlockDnd();
  const [isMouseDown, setIsMouseDown] = useState(false);

  useEffect(() => {
    setIsMouseDown(draggedEventType === type);
  }, [draggedEventType, type]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isDisabled) return;
    onMouseDown(e, type as TDraggableEvent["type"]);
  };

  return (
    <Tooltip.Root disabled={!tooltip}>
      <Tooltip.Trigger
        render={
          <div className="flex relative">
            <div
              className={cx(
                "flex items-center gap-2 border rounded-lg flex-1 px-4 py-2 bg-gray-1 transition-[box-shadow,background-color]",
                isMouseDown ? "min-h-[42px]" : undefined,
                isDisabled
                  ? "cursor-not-allowed"
                  : "cursor-grab hover:shadow-md",
                isMouseDown || isDisabled ? "opacity-40" : "opacity-100",
              )}
              onMouseDown={handleMouseDown}
            >
              {!isMouseDown ? children : null}
            </div>
          </div>
        }
      />
      <Tooltip.Popup>{tooltip}</Tooltip.Popup>
    </Tooltip.Root>
  );
};
