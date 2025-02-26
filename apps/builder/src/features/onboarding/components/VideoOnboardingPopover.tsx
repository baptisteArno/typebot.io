import { CloseIcon, VideoPopoverIcon } from "@/components/icons";
import { useUser } from "@/features/user/hooks/useUser";
import {
  IconButton,
  type IconButtonProps,
  type PlacementWithLogical,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
} from "@chakra-ui/react";
import type { ForgedBlockDefinition } from "@typebot.io/forge-repository/definitions";
import type { ReactNode } from "react";
import { onboardingVideos } from "../data";
import { useOnboardingDisclosure } from "../hooks/useOnboardingDisclosure";
import { YoutubeIframe } from "./YoutubeIframe";

type Props = {
  type: keyof typeof onboardingVideos;
  isEnabled?: boolean;
  blockDef?: ForgedBlockDefinition;
  placement?: PlacementWithLogical;
  children: ((props: { onOpen: () => void }) => JSX.Element) | ReactNode;
};

const Root = ({
  type,
  blockDef,
  children,
  isEnabled,
  placement = "right",
}: Props): JSX.Element => {
  const { user, updateUser } = useUser();
  const youtubeId =
    onboardingVideos[type]?.youtubeId ?? blockDef?.onboarding?.youtubeId;
  const { isOpen, onClose, onOpen } = useOnboardingDisclosure({
    key: type,
    updateUser,
    user,
    blockDef,
    isEnabled,
  });

  if (!youtubeId)
    return typeof children === "function"
      ? children({ onOpen })
      : (children as JSX.Element);

  return (
    <Popover isOpen={isOpen} placement={placement} isLazy>
      <PopoverTrigger>
        {typeof children === "function" ? children({ onOpen }) : children}
      </PopoverTrigger>

      <PopoverContent aspectRatio="1.5" width="640px" shadow="xl">
        <PopoverArrow />
        <PopoverBody h="full" p="5">
          <YoutubeIframe id={youtubeId} />
          <IconButton
            icon={<CloseIcon />}
            aria-label={"Close"}
            pos="absolute"
            top="-3"
            right="-3"
            colorScheme="blackAlpha"
            size="sm"
            rounded="full"
            onClick={onClose}
          />
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

const TriggerIconButton = (props: Omit<IconButtonProps, "aria-label">) => (
  <IconButton
    size="sm"
    icon={<VideoPopoverIcon />}
    aria-label={"Open Bubbles help video"}
    variant="ghost"
    colorScheme="orange"
    {...props}
  />
);

export const VideoOnboardingPopover = {
  Root,
  TriggerIconButton,
};
