import { useTranslate } from "@tolgee/react";
import { Badge } from "@typebot.io/ui/components/Badge";
import { Button } from "@typebot.io/ui/components/Button";
import { useOpenControls } from "@typebot.io/ui/hooks/useOpenControls";
import { FolderAddIcon } from "@typebot.io/ui/icons/FolderAddIcon";
import { SquareLock01Icon } from "@typebot.io/ui/icons/SquareLock01Icon";
import { ChangePlanDialog } from "@/features/billing/components/ChangePlanDialog";
import { isFreePlan } from "@/features/billing/helpers/isFreePlan";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";

type Props = { isLoading: boolean; onClick: () => void };

export const CreateFolderButton = ({ isLoading, onClick }: Props) => {
  const { t } = useTranslate();
  const { workspace } = useWorkspace();
  const { isOpen, onOpen, onClose } = useOpenControls();

  const handleClick = () => {
    if (isFreePlan(workspace)) return onOpen();
    onClick();
  };
  return (
    <>
      <Button
        onClick={handleClick}
        disabled={isLoading}
        variant="outline-secondary"
        className="bg-gray-1"
      >
        <FolderAddIcon className="text-blue-10" />
        <div className="flex items-center gap-2">
          <p>{t("folders.createFolderButton.label")}</p>
          {isFreePlan(workspace) && (
            <Badge colorScheme="orange">
              <SquareLock01Icon />
            </Badge>
          )}
        </div>
      </Button>
      <ChangePlanDialog
        isOpen={isOpen}
        onClose={onClose}
        type={t("billing.limitMessage.folder")}
      />
    </>
  );
};
