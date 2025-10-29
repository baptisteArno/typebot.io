import { useTranslate } from "@tolgee/react";
import { Button } from "@typebot.io/ui/components/Button";
import { Field } from "@typebot.io/ui/components/Field";
import { useOpenControls } from "@typebot.io/ui/hooks/useOpenControls";
import { HardDriveIcon } from "@typebot.io/ui/icons/HardDriveIcon";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EditableEmojiOrImageIcon } from "@/components/EditableEmojiOrImageIcon";
import { CopyInput } from "@/components/inputs/CopyInput";
import { DebouncedTextInput } from "@/components/inputs/DebouncedTextInput";
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
            defaultIcon={HardDriveIcon}
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
  return (
    <>
      <Button variant="destructive" onClick={onOpen}>
        {t("workspace.settings.deleteButton.label")}
      </Button>
      <ConfirmDialog
        isOpen={isOpen}
        onConfirm={onConfirm}
        onClose={onClose}
        confirmButtonLabel="Delete"
      >
        <p>
          {t("workspace.settings.deleteButton.confirmMessage", {
            workspaceName,
          })}
        </p>
      </ConfirmDialog>
    </>
  );
};
