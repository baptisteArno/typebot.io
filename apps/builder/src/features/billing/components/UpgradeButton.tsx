import { useTranslate } from "@tolgee/react";
import { isNotDefined } from "@typebot.io/lib/utils";
import { Button, type ButtonProps } from "@typebot.io/ui/components/Button";
import { useOpenControls } from "@typebot.io/ui/hooks/useOpenControls";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { ChangePlanDialog } from "./ChangePlanDialog";

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
  const { isOpen, onOpen, onClose } = useOpenControls();
  const { workspace } = useWorkspace();
  return (
    <>
      <Button
        variant="secondary"
        {...props}
        disabled={isNotDefined(workspace)}
        onClick={onOpen}
      >
        {props.children ?? t("upgrade")}
      </Button>
      <ChangePlanDialog
        isOpen={isOpen}
        onClose={onClose}
        type={limitReachedType}
        excludedPlans={excludedPlans}
      />
    </>
  );
};
