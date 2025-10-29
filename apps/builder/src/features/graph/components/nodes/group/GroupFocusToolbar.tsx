import { Button } from "@typebot.io/ui/components/Button";
import { Copy01Icon } from "@typebot.io/ui/icons/Copy01Icon";
import { PlayIcon } from "@typebot.io/ui/icons/PlayIcon";
import { TrashIcon } from "@typebot.io/ui/icons/TrashIcon";
import { cn } from "@typebot.io/ui/lib/cn";
import { useIsAnalyzing } from "@/features/graph/hooks/useIsAnalyzing";
import { isMac } from "@/helpers/isMac";

type Props = {
  groupId: string;
  isReadOnly: boolean;
  className?: string;
  onPlayClick: () => void;
};

export const GroupFocusToolbar = ({
  isReadOnly,
  onPlayClick,
  className,
}: Props) => {
  const isAnalyzing = useIsAnalyzing();

  const dispatchCopyEvent = () => {
    dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "c",
        [isMac() ? "metaKey" : "ctrlKey"]: true,
      }),
    );
  };

  const dispatchDeleteEvent = () => {
    dispatchEvent(new KeyboardEvent("keydown", { key: "Backspace" }));
  };

  return (
    <div
      className={cn(
        "flex items-center rounded-md gap-0 border shadow-md bg-gray-1",
        className,
      )}
    >
      {!isAnalyzing && (
        <Button
          className="size-8 border-r rounded-r-none"
          aria-label={"Preview bot from this group"}
          variant="ghost"
          onClick={onPlayClick}
          size="icon"
        >
          <PlayIcon />
        </Button>
      )}
      {!isReadOnly && (
        <Button
          className="border-r rounded-r-none rounded-l-none size-8"
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
      {!isReadOnly && (
        <Button
          className="border-l rounded-l-none size-8"
          aria-label="Delete"
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
