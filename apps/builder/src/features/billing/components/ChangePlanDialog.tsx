import { AlertInfo } from "@/components/AlertInfo";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { HStack } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { Button } from "@typebot.io/ui/components/Button";
import { Dialog } from "@typebot.io/ui/components/Dialog";
import { cx } from "@typebot.io/ui/lib/cva";
import { ChangePlanForm } from "./ChangePlanForm";

export type ChangePlanDialogProps = {
  type?: string;
  isOpen: boolean;
  excludedPlans?: ("STARTER" | "PRO")[];
  onClose: () => void;
};

export const ChangePlanDialog = ({
  onClose,
  isOpen,
  type,
  excludedPlans,
}: ChangePlanDialogProps) => {
  const { t } = useTranslate();
  const { workspace, currentUserMode } = useWorkspace();

  return (
    <Dialog.Root isOpen={isOpen} onClose={onClose}>
      <Dialog.Popup className={cx("max-w-2xl", excludedPlans && "max-w-lg")}>
        <Dialog.Title className="pr-10">
          {t("billing.upgradeLimitLabel", { type: type })}
        </Dialog.Title>
        <Dialog.CloseButton />

        {type && (
          <AlertInfo>
            {t("billing.upgradeLimitLabel", { type: type })}
          </AlertInfo>
        )}
        {workspace && (
          <ChangePlanForm
            workspace={workspace}
            excludedPlans={excludedPlans}
            currentUserMode={currentUserMode}
          />
        )}

        <Dialog.Footer>
          <HStack>
            <Button variant="secondary" onClick={onClose}>
              {t("cancel")}
            </Button>
          </HStack>
        </Dialog.Footer>
      </Dialog.Popup>
    </Dialog.Root>
  );
};
