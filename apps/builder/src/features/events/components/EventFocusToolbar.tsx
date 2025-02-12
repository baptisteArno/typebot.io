import {
  InfoIcon,
  PlayIcon,
  SettingsIcon,
  TrashIcon,
} from "@/components/icons";
import {
  HStack,
  IconButton,
  Tooltip,
  useClipboard,
  useColorModeValue,
} from "@chakra-ui/react";

type Props = {
  eventId: string;
  onPlayClick: () => void;
  onSettingsClick: () => void;
  onDeleteClick?: () => void;
};

export const EventFocusToolbar = ({
  eventId,
  onPlayClick,
  onSettingsClick,
  onDeleteClick,
}: Props) => {
  const { hasCopied, onCopy } = useClipboard(eventId);

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
      {onDeleteClick ? (
        <IconButton
          aria-label="Delete"
          borderLeftRadius="none"
          icon={<TrashIcon />}
          onClick={onDeleteClick}
          variant="ghost"
          size="sm"
        />
      ) : null}
    </HStack>
  );
};
