import type { ForgedBlockDefinition } from "@typebot.io/forge-repository/definitions";
import { Button } from "@typebot.io/ui/components/Button";
import { Popover } from "@typebot.io/ui/components/Popover";
import type { ReactNode } from "react";
import { CloseIcon } from "@/components/icons";
import { useUser } from "@/features/user/hooks/useUser";
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
        <Button
          aria-label={"Close"}
          className="size-8 rounded-full -right-3 -top-3 absolute"
          variant="secondary"
          onClick={onClose}
        >
          <CloseIcon />
        </Button>
      </Popover.Popup>
    </Popover.Root>
  );
};
