import { CopyIcon, PlayIcon } from "@/components/icons";
import { useIsAnalyzing } from "@/features/graph/hooks/useIsAnalyzing";
import { isMac } from "@/helpers/isMac";
import { HStack, useColorModeValue } from "@chakra-ui/react";
import { Button } from "@typebot.io/ui/components/Button";
import { TrashIcon } from "@typebot.io/ui/icons/TrashIcon";

type Props = {
  groupId: string;
  isReadOnly: boolean;
  onPlayClick: () => void;
};

export const GroupFocusToolbar = ({ isReadOnly, onPlayClick }: Props) => {
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
    <HStack
      rounded="md"
      spacing={0}
      borderWidth="1px"
      bgColor={useColorModeValue("white", "gray.900")}
      shadow="md"
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
          <CopyIcon />
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
    </HStack>
  );
};
