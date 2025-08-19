import {
  CopyIcon,
  InfoIcon,
  PlayIcon,
  SettingsIcon,
  TrashIcon,
} from "@/components/icons";
import { isMac } from "@/helpers/isMac";
import { toast } from "@/lib/toast";
import {
  HStack,
  IconButton,
  useClipboard,
  useColorModeValue,
} from "@chakra-ui/react";
import { EventType } from "@typebot.io/events/constants";
import { Tooltip } from "@typebot.io/ui/components/Tooltip";

type Props = {
  eventId: string;
  type: EventType;
  onPlayClick: () => void;
  onSettingsClick: () => void;
};

export const EventFocusToolbar = ({
  eventId,
  type,
  onPlayClick,
  onSettingsClick,
}: Props) => {
  const { onCopy } = useClipboard(eventId);

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
    <HStack
      rounded="md"
      spacing={0}
      borderWidth="1px"
      bgColor={useColorModeValue("white", "gray.900")}
      shadow="md"
    >
      <IconButton
        icon={<PlayIcon />}
        borderRightWidth="1px"
        borderRightRadius="none"
        aria-label={"Preview bot from this group"}
        variant="ghost"
        onClick={onPlayClick}
        size="sm"
      />
      <IconButton
        icon={<SettingsIcon />}
        aria-label={"Show event settings"}
        variant="ghost"
        size="sm"
        onClick={onSettingsClick}
      />
      {type !== EventType.START && (
        <IconButton
          icon={<CopyIcon />}
          borderRightWidth="1px"
          borderRightRadius="none"
          borderLeftRadius="none"
          aria-label={"Copy group"}
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            dispatchCopyEvent();
          }}
          size="sm"
        />
      )}

      {type !== EventType.START && (
        <IconButton
          aria-label="Delete"
          borderLeftRadius="none"
          icon={<TrashIcon />}
          onClick={dispatchDeleteEvent}
          variant="ghost"
          size="sm"
        />
      )}
    </HStack>
  );
};
