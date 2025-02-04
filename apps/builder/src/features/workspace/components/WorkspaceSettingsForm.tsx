import { ConfirmModal } from "@/components/ConfirmModal";
import { CopyButton } from "@/components/CopyButton";
import { EditableEmojiOrImageIcon } from "@/components/EditableEmojiOrImageIcon";
import { TextInput } from "@/components/inputs";
import {
  Button,
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
import React from "react";
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
              boxSize="40px"
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
                <CopyButton textToCopy={workspace.id} size="xs" />
              </InputRightElement>
            </InputGroup>
            <FormHelperText>
              Used when interacting with the Typebot API.
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
      <Button colorScheme="red" variant="outline" onClick={onOpen}>
        {t("workspace.settings.deleteButton.label")}
      </Button>
      <ConfirmModal
        isOpen={isOpen}
        onConfirm={onConfirm}
        onClose={onClose}
        message={
          <Text>
            {t("workspace.settings.deleteButton.confirmMessage", {
              workspaceName,
            })}
          </Text>
        }
        confirmButtonLabel="Delete"
      />
    </>
  );
};
