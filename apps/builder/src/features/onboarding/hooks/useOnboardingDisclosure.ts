import { useDisclosure } from "@chakra-ui/react";
import type { ForgedBlockDefinition } from "@typebot.io/forge-repository/definitions";
import type { User } from "@typebot.io/user/schemas";
import { useEffect, useState } from "react";
import { onboardingVideos } from "../data";

type Props = {
  key?: keyof typeof onboardingVideos;
  updateUser: (data: Partial<User>) => void;
  user?: Pick<User, "createdAt" | "displayedInAppNotifications">;
  defaultOpenDelay?: number;
  blockDef: ForgedBlockDefinition | undefined;
  isEnabled?: boolean;
};

export const useOnboardingDisclosure = ({
  key,
  updateUser,
  user,
  defaultOpenDelay,
  blockDef,
  isEnabled = true,
}: Props) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure({
    onOpen: () => {
      if (!user || !key || user.displayedInAppNotifications?.[key]) return;
      updateUser({
        displayedInAppNotifications: {
          ...user.displayedInAppNotifications,
          [key]: true,
        },
      });
    },
  });

  useEffect(() => {
    if (isInitialized || !user?.createdAt || !key || !isEnabled) return;
    setIsInitialized(true);
    if (
      key &&
      (!onboardingVideos[key]?.deployedAt ||
        new Date(user.createdAt) >=
          (onboardingVideos[key]
            ? onboardingVideos[key]!.deployedAt
            : (blockDef?.onboarding?.deployedAt ?? new Date()))) &&
      user.displayedInAppNotifications?.[key] === undefined
    ) {
      if (defaultOpenDelay) {
        setTimeout(() => {
          onOpen();
        }, defaultOpenDelay);
      } else {
        onOpen();
      }
    }
  }, [
    blockDef?.onboarding?.deployedAt,
    defaultOpenDelay,
    isInitialized,
    key,
    onOpen,
    user?.createdAt,
    user?.displayedInAppNotifications,
    isEnabled,
  ]);

  return { isOpen, onClose, onOpen };
};
