import {
  CopyIcon,
  InfoIcon,
  PlayIcon,
  SettingsIcon,
  TrashIcon,
} from "@/components/icons";
import { isMac } from "@/helpers/isMac";
import {
  HStack,
  IconButton,
  Tooltip,
  useClipboard,
  useColorModeValue,
} from "@chakra-ui/react";
import { EventType } from "@typebot.io/events/constants";

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
  const { hasCopied, onCopy } = useClipboard(eventId);

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
      <Tooltip
        label={hasCopied ? "Copied!" : eventId}
        closeOnClick={false}
        placement="top"
      >
        <IconButton
          icon={<InfoIcon />}
          borderRightWidth="1px"
          borderRightRadius="none"
          borderLeftRadius="none"
          aria-label={"Show group info"}
          variant="ghost"
          size="sm"
          onClick={onCopy}
        />
      </Tooltip>
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
