import { EventType } from "@typebot.io/events/constants";
import { Button } from "@typebot.io/ui/components/Button";
import { Copy01Icon } from "@typebot.io/ui/icons/Copy01Icon";
import { PlayIcon } from "@typebot.io/ui/icons/PlayIcon";
import { Settings01Icon } from "@typebot.io/ui/icons/Settings01Icon";
import { TrashIcon } from "@typebot.io/ui/icons/TrashIcon";
import { cn } from "@typebot.io/ui/lib/cn";
import { isMac } from "@/helpers/isMac";

type Props = {
  eventId: string;
  type: EventType;
  className?: string;
  onPlayClick: () => void;
  onSettingsClick: () => void;
};

export const EventFocusToolbar = ({
  type,
  className,
  onPlayClick,
  onSettingsClick,
}: Props) => {
  const dispatchCopyEvent = () => {
    if (type === EventType.START) return;
    dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "c",
        [isMac() ? "metaKey" : "ctrlKey"]: true,
      }),
    );
  };

  const dispatchDeleteEvent = () => {
    if (type === EventType.START) return;
    dispatchEvent(new KeyboardEvent("keydown", { key: "Backspace" }));
  };

  return (
    <div
      className={cn(
        "flex items-center rounded-md gap-0 border shadow-md bg-gray-1",
        className,
      )}
    >
      <Button
        className="border-r rounded-r-none"
        aria-label={"Preview bot from this group"}
        variant="ghost"
        onClick={onPlayClick}
        size="icon"
      >
        <PlayIcon />
      </Button>
      <Button
        aria-label={"Show event settings"}
        variant="ghost"
        size="icon"
        onClick={onSettingsClick}
      >
        <Settings01Icon />
      </Button>
      {type !== EventType.START && (
        <Button
          className="border-r rounded-r-none rounded-l-none"
          aria-label={"Copy group"}
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            dispatchCopyEvent();
          }}
          size="icon"
        >
          <Copy01Icon />
        </Button>
      )}
      {type !== EventType.START && (
        <Button
          aria-label="Delete"
          className="border-l rounded-l-none"
          onClick={dispatchDeleteEvent}
          variant="ghost"
          size="icon"
        >
          <TrashIcon />
        </Button>
      )}
    </div>
  );
};
