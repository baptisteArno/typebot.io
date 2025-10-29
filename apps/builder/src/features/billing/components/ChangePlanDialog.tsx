import { useTranslate } from "@tolgee/react";
import { Alert } from "@typebot.io/ui/components/Alert";
import { Button } from "@typebot.io/ui/components/Button";
import { Dialog } from "@typebot.io/ui/components/Dialog";
import { InformationSquareIcon } from "@typebot.io/ui/icons/InformationSquareIcon";
import { cx } from "@typebot.io/ui/lib/cva";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
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
          <Alert.Root>
            <InformationSquareIcon />
            <Alert.Description>
              {t("billing.upgradeLimitLabel", { type: type })}
            </Alert.Description>
          </Alert.Root>
        )}
        {workspace && (
          <ChangePlanForm
            workspace={workspace}
            excludedPlans={excludedPlans}
            currentUserMode={currentUserMode}
          />
        )}

        <Dialog.Footer>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onClose}>
              {t("cancel")}
            </Button>
          </div>
        </Dialog.Footer>
      </Dialog.Popup>
    </Dialog.Root>
  );
};
