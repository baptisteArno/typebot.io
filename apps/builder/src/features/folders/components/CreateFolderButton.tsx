import { FolderPlusIcon } from "@/components/icons";
import { ChangePlanModal } from "@/features/billing/components/ChangePlanModal";
import { LockTag } from "@/features/billing/components/LockTag";
import { isFreePlan } from "@/features/billing/helpers/isFreePlan";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { Button, HStack, Text, useDisclosure } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { Plan } from "@typebot.io/prisma/enum";
import React from "react";

type Props = { isLoading: boolean; onClick: () => void };

export const CreateFolderButton = ({ isLoading, onClick }: Props) => {
  const { t } = useTranslate();
  const { workspace } = useWorkspace();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleClick = () => {
    if (isFreePlan(workspace)) return onOpen();
    onClick();
  };
  return (
    <Button
      leftIcon={<FolderPlusIcon />}
      onClick={handleClick}
      isLoading={isLoading}
    >
      <HStack>
        <Text>{t("folders.createFolderButton.label")}</Text>
        {isFreePlan(workspace) && <LockTag plan={Plan.STARTER} />}
      </HStack>
      <ChangePlanModal
        isOpen={isOpen}
        onClose={onClose}
        type={t("billing.limitMessage.folder")}
      />
    </Button>
  );
};
