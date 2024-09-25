import { useDisclosure } from "@chakra-ui/react";
import type { ForgedBlockDefinition } from "@typebot.io/forge-repository/definitions";
import type { User } from "@typebot.io/schemas/features/user/schema";
import { useEffect, useState } from "react";
import { onboardingVideos } from "../data";

type Props = {
  key?: keyof typeof onboardingVideos;
  updateUser: (data: Partial<User>) => void;
  user?: Pick<User, "createdAt" | "displayedInAppNotifications">;
  defaultOpenDelay?: number;
  blockDef: ForgedBlockDefinition | undefined;
};

export const useOnboardingDisclosure = ({
  key,
  updateUser,
  user,
  defaultOpenDelay,
  blockDef,
}: Props) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const { isOpen, onOpen, onClose, onToggle } = useDisclosure({
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
    if (isInitialized || !user?.createdAt || !key) return;
    setIsInitialized(true);
    if (
      key &&
      new Date(user.createdAt) >=
        (onboardingVideos[key]
          ? onboardingVideos[key]!.deployedAt
          : (blockDef?.onboarding?.deployedAt ?? new Date())) &&
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
  ]);

  return { isOpen, onClose, onToggle };
};
