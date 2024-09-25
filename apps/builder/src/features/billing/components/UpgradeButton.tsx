import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { Button, type ButtonProps, useDisclosure } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { isNotDefined } from "@typebot.io/lib/utils";
import React from "react";
import { ChangePlanModal } from "./ChangePlanModal";

type Props = {
  limitReachedType?: string;
  excludedPlans?: ("STARTER" | "PRO")[];
} & ButtonProps;

export const UpgradeButton = ({
  limitReachedType,
  excludedPlans,
  ...props
}: Props) => {
  const { t } = useTranslate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { workspace } = useWorkspace();
  return (
    <Button
      colorScheme="blue"
      {...props}
      isLoading={isNotDefined(workspace)}
      onClick={onOpen}
    >
      {props.children ?? t("upgrade")}
      <ChangePlanModal
        isOpen={isOpen}
        onClose={onClose}
        type={limitReachedType}
        excludedPlans={excludedPlans}
      />
    </Button>
  );
};
