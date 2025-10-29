import type { TDraggableEvent } from "@typebot.io/events/schemas";
import { cn } from "@typebot.io/ui/lib/cn";
import { EventIcon } from "./EventIcon";
import { EventLabel } from "./EventLabel";

export const EventCardOverlay = ({
  type,
  className,
  style,
  onMouseUp,
}: {
  type: TDraggableEvent["type"];
  className?: string;
  style?: React.CSSProperties;
  onMouseUp: () => void;
}) => {
  return (
    <div
      className={cn(
        "flex items-center gap-2 border rounded-lg w-[147px] px-4 py-2 shadow-xl cursor-grabbing transition-none pointer-events-none z-10 border-gray-9 bg-gray-1",
        className,
      )}
      onMouseUp={onMouseUp}
      style={style}
    >
      <EventIcon type={type} />
      <EventLabel type={type} />
    </div>
  );
};
