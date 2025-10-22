import { HStack, Text, useDisclosure } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { Badge } from "@typebot.io/ui/components/Badge";
import { Button } from "@typebot.io/ui/components/Button";
import { FolderAddIcon } from "@typebot.io/ui/icons/FolderAddIcon";
import { SquareLock01Icon } from "@typebot.io/ui/icons/SquareLock01Icon";
import { ChangePlanDialog } from "@/features/billing/components/ChangePlanDialog";
import { isFreePlan } from "@/features/billing/helpers/isFreePlan";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";

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
    <>
      <Button
        onClick={handleClick}
        disabled={isLoading}
        variant="outline-secondary"
        className="bg-gray-1"
      >
        <FolderAddIcon className="text-blue-10" />
        <HStack>
          <Text>{t("folders.createFolderButton.label")}</Text>
          {isFreePlan(workspace) && (
            <Badge colorScheme="orange">
              <SquareLock01Icon />
            </Badge>
          )}
        </HStack>
      </Button>
      <ChangePlanDialog
        isOpen={isOpen}
        onClose={onClose}
        type={t("billing.limitMessage.folder")}
      />
    </>
  );
};
