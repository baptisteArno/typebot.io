import { CloseIcon } from "@/components/icons";
import { useUser } from "@/features/user/hooks/useUser";
import { IconButton } from "@chakra-ui/react";
import type { ForgedBlockDefinition } from "@typebot.io/forge-repository/definitions";
import { Popover } from "@typebot.io/ui/components/Popover";
import type { ReactNode } from "react";
import { onboardingVideos } from "../data";
import { useOnboardingDisclosure } from "../hooks/useOnboardingDisclosure";
import { YoutubeIframe } from "./YoutubeIframe";

type Props = {
  type: keyof typeof onboardingVideos;
  isEnabled?: boolean;
  blockDef?: ForgedBlockDefinition;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  offset?: number;
  children:
    | ((props: { onOpen: () => void; onToggle: () => void }) => JSX.Element)
    | ReactNode;
};

export const VideoOnboardingPopover = ({
  type,
  blockDef,
  children,
  isEnabled,
  side = "right",
  align,
  offset,
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

  const toggle = () => {
    if (isOpen) onClose();
    else onOpen();
  };

  if (!youtubeId)
    return typeof children === "function"
      ? children({ onOpen, onToggle: toggle })
      : (children as JSX.Element);

  return (
    <Popover.Root isOpen={isOpen} onClose={onClose}>
      <Popover.Trigger>
        {typeof children === "function"
          ? children({ onOpen, onToggle: toggle })
          : children}
      </Popover.Trigger>
      <Popover.Popup
        side={side}
        align={align}
        offset={offset}
        className="w-[640px] shadow-md aspect-[1.5]"
      >
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
      </Popover.Popup>
    </Popover.Root>
  );
};
