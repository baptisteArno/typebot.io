import { ConfirmModal } from "@/components/ConfirmModal";
import { CopyButton } from "@/components/CopyButton";
import { EditableEmojiOrImageIcon } from "@/components/EditableEmojiOrImageIcon";
import { ChevronDownIcon } from "@/components/icons";
import { TextInput } from "@/components/inputs";
import { SwitchWithLabel } from "@/components/inputs/SwitchWithLabel";
import { BlockIcon } from "@/features/editor/components/BlockIcon";
import { BlockLabel } from "@/features/editor/components/BlockLabel";
import { ForgedBlockIcon } from "@/features/forge/ForgedBlockIcon";
import { ForgedBlockLabel } from "@/features/forge/ForgedBlockLabel";
import { trpc } from "@/lib/trpc";
import {
  Button,
  Card,
  Divider,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  Input,
  InputGroup,
  InputRightElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import React, { useState } from "react";
import { useWorkspace } from "../WorkspaceProvider";

type aiProvidersType = "openai" | "open-router" | "anthropic";

const aiProviders: aiProvidersType[] = ["openai", "open-router", "anthropic"];

export const WorkspaceSettingsForm = ({ onClose }: { onClose: () => void }) => {
  const { t } = useTranslate();
  const { workspace, workspaces, updateWorkspace, deleteCurrentWorkspace } =
    useWorkspace();

  const [selectedAiProvider, setSelectedAiProvider] = useState<
    aiProvidersType | undefined
  >(undefined);

  const { data, isLoading, refetch } =
    trpc.credentials.listCredentials.useQuery(
      {
        workspaceId: workspace!.id,
        type: selectedAiProvider,
      },
      {
        enabled: !!workspace?.id && !!selectedAiProvider,
      },
    );

  const handleNameChange = (name: string) => {
    if (!workspace?.id) return;
    updateWorkspace({ name });
  };

  const updateInEditorAiFeaturesEnabled = (
    inEditorAiFeaturesEnabled: boolean,
  ) => {
    if (!workspace?.id) return;
    updateWorkspace({ inEditorAiFeaturesEnabled });
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

          <Stack spacing="4" mb={4}>
            <SwitchWithLabel
              label={"In-Editor AI Features"}
              initialValue={workspace.inEditorAiFeaturesEnabled}
              onCheckChange={updateInEditorAiFeaturesEnabled}
              moreInfoContent="To enable AI features within this workspace"
              justifyContent="start"
            />
            {!!workspace.inEditorAiFeaturesEnabled && (
              <>
                <HStack>
                  <FormLabel>AI Provider:</FormLabel>
                  <Menu isLazy>
                    <MenuButton
                      as={Button}
                      size="sm"
                      rightIcon={<ChevronDownIcon />}
                    >
                      {selectedAiProvider ? (
                        <Flex gap={2}>
                          <ForgedBlockIcon type={selectedAiProvider} />
                          <ForgedBlockLabel type={selectedAiProvider} />
                        </Flex>
                      ) : (
                        "Choose Provider"
                      )}
                    </MenuButton>
                    <MenuList>
                      {aiProviders.map((type) => (
                        <MenuItem
                          key={type}
                          icon={<BlockIcon type={type} boxSize="16px" />}
                          onClick={() => {
                            setSelectedAiProvider(type);
                            refetch();
                          }}
                        >
                          <BlockLabel type={type} />
                        </MenuItem>
                      ))}
                    </MenuList>
                  </Menu>
                </HStack>

                {!!selectedAiProvider &&
                  !!data &&
                  !!data.credentials &&
                  !isLoading && (
                    <Stack>
                      {data?.credentials.map((cred: any) => (
                        <Stack key={cred.id}>
                          <Card padding="1rem">
                            <Text>{cred.name}</Text>
                          </Card>
                          {/* <Text>{JSON.stringify(cred)}</Text> */}
                          <Divider />
                        </Stack>
                      ))}
                    </Stack>
                  )}
              </>
            )}
          </Stack>
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
