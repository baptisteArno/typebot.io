import { useTranslate } from "@tolgee/react";
import { AlertDialog } from "@typebot.io/ui/components/AlertDialog";
import { Button } from "@typebot.io/ui/components/Button";
import { DebouncedTextInput } from "@typebot.io/ui/components/DebouncedTextInput";
import { Field } from "@typebot.io/ui/components/Field";
import { useOpenControls } from "@typebot.io/ui/hooks/useOpenControls";
import { HardDriveIcon } from "@typebot.io/ui/icons/HardDriveIcon";
import { useRef, useState } from "react";
import { EditableEmojiOrImageIcon } from "@/components/EditableEmojiOrImageIcon";
import { CopyInput } from "@/components/inputs/CopyInput";
import { useWorkspace } from "../WorkspaceProvider";

export const WorkspaceSettingsForm = ({ onClose }: { onClose: () => void }) => {
  const { t } = useTranslate();
  const { workspace, workspaces, updateWorkspace, deleteCurrentWorkspace } =
    useWorkspace();

  const handleNameChange = (name: string) => {
    if (!workspace?.id) return;
    updateWorkspace({ name });
  };

  const handleChangeIcon = (icon: string) => updateWorkspace({ icon });

  const handleDeleteClick = async () => {
    await deleteCurrentWorkspace();
    onClose();
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <Field.Root>
        <Field.Label>{t("workspace.settings.icon.title")}</Field.Label>
        {workspace && (
          <EditableEmojiOrImageIcon
            uploadFileProps={{
              workspaceId: workspace.id,
              fileName: "icon",
            }}
            icon={workspace.icon}
            onChangeIcon={handleChangeIcon}
            size="lg"
            defaultIcon={<HardDriveIcon className="size-full" />}
          />
        )}
      </Field.Root>
      {workspace && (
        <>
          <Field.Root>
            <Field.Label>{t("workspace.settings.name.label")}</Field.Label>
            <DebouncedTextInput
              defaultValue={workspace?.name}
              onValueChange={handleNameChange}
            />
          </Field.Root>
          <Field.Root>
            <Field.Label>ID:</Field.Label>
            <CopyInput value={workspace.id} />
            <Field.Description>
              {t("workspace.settings.id.helperText")}
            </Field.Description>
          </Field.Root>
        </>
      )}
      {workspace && workspaces && workspaces.length > 1 && (
        <DeleteWorkspaceButton
          onConfirm={handleDeleteClick}
          workspaceName={workspace?.name}
        />
      )}
    </div>
  );
};

const DeleteWorkspaceButton = ({
  workspaceName,
  onConfirm,
}: {
  workspaceName: string;
  onConfirm: () => Promise<void>;
}) => {
  const { t } = useTranslate();
  const { isOpen, onOpen, onClose } = useOpenControls();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const cancelRef = useRef<HTMLButtonElement | null>(null);

  const onConfirmClick = async () => {
    setConfirmLoading(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <>
      <Button variant="destructive" onClick={onOpen}>
        {t("workspace.settings.deleteButton.label")}
      </Button>
      <AlertDialog.Root isOpen={isOpen} onClose={onClose}>
        <AlertDialog.Content initialFocus={cancelRef}>
          <AlertDialog.Header>
            <AlertDialog.Title>
              {t("confirmModal.defaultTitle")}
            </AlertDialog.Title>
            <AlertDialog.Description>
              <p>
                {t("workspace.settings.deleteButton.confirmMessage", {
                  workspaceName,
                })}
              </p>
            </AlertDialog.Description>
          </AlertDialog.Header>
          <AlertDialog.Footer>
            <AlertDialog.Cancel ref={cancelRef}>
              {t("cancel")}
            </AlertDialog.Cancel>
            <AlertDialog.Action
              variant="destructive"
              disabled={confirmLoading}
              onClick={onConfirmClick}
            >
              Delete
            </AlertDialog.Action>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </>
  );
};
