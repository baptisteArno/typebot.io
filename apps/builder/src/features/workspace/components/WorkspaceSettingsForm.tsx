import {
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { Button } from "@typebot.io/ui/components/Button";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { CopyButton } from "@/components/CopyButton";
import { EditableEmojiOrImageIcon } from "@/components/EditableEmojiOrImageIcon";
import { HardDriveIcon } from "@/components/icons";
import { TextInput } from "@/components/inputs";
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
          <FormControl>
            <FormLabel>ID:</FormLabel>
            <InputGroup>
              <Input
                type={"text"}
                defaultValue={workspace.id}
                pr="16"
                readOnly
              />
              <InputRightElement width="72px">
                <CopyButton textToCopy={workspace.id} />
              </InputRightElement>
            </InputGroup>
            <FormHelperText>
              {t("workspace.settings.id.helperText")}
            </FormHelperText>
          </FormControl>
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
