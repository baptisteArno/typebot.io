import {
  Flex,
  FormControl,
  FormLabel,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { Button } from "@typebot.io/ui/components/Button";
import { Field } from "@typebot.io/ui/components/Field";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EditableEmojiOrImageIcon } from "@/components/EditableEmojiOrImageIcon";
import { HardDriveIcon } from "@/components/icons";
import { CopyInput } from "@/components/inputs/CopyInput";
import { TextInput } from "@/components/inputs/TextInput";
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
    <Stack spacing="6" w="full">
      <FormControl>
        <FormLabel>{t("workspace.settings.icon.title")}</FormLabel>
        <Flex>
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
        </Flex>
      </FormControl>
      {workspace && (
        <>
          <TextInput
            label={t("workspace.settings.name.label")}
            withVariableButton={false}
            defaultValue={workspace?.name}
            onChange={handleNameChange}
          />
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
    </Stack>
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
  const { isOpen, onOpen, onClose } = useDisclosure();
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
        <Text>
          {t("workspace.settings.deleteButton.confirmMessage", {
            workspaceName,
          })}
        </Text>
      </ConfirmDialog>
    </>
  );
};
