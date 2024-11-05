import { ChevronDownIcon, PlusIcon, ToolIcon } from "@/components/icons";
import { Textarea } from "@/components/inputs";
import { OpenAICredentialsModal } from "@/features/blocks/integrations/openai/components/OpenAICredentialsModal";
import { BlockIcon } from "@/features/editor/components/BlockIcon";
import { BlockLabel } from "@/features/editor/components/BlockLabel";
import { ForgedBlockIcon } from "@/features/forge/ForgedBlockIcon";
import { ForgedBlockLabel } from "@/features/forge/ForgedBlockLabel";
import { CreateForgedCredentialsModal } from "@/features/forge/components/credentials/CreateForgedCredentialsModal";
import { useForgedBlock } from "@/features/forge/hooks/useForgedBlock";
import { trpc } from "@/lib/trpc";
import {
  Button,
  Flex,
  FormLabel,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { defaultPromptToGenerateGroupTitles } from "../../../../../../packages/workspaces/src/defaultAiPrompts";
import { useWorkspace } from "../WorkspaceProvider";

type aiProvidersType = "openai" | "open-router" | "anthropic";

const aiProviders: aiProvidersType[] = ["openai", "open-router", "anthropic"];

export const InEditorAIFeatures = () => {
  const { workspace, updateWorkspace } = useWorkspace();
  const [selectedAiProvider, setSelectedAiProvider] = useState<
    aiProvidersType | undefined
  >(undefined);
  const [selectedAiCredential, setSelectedAiCredential] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [aiFeaturePrompt, setAiFeaturePrompt] = useState<string>(
    workspace?.aiFeaturePrompt ?? "",
  );

  const {
    isOpen: isAIModalOpen,
    onOpen: onAIModalOpen,
    onClose: onAIModalClose,
  } = useDisclosure();

  const {
    data: credentialsList,
    isLoading: loadingCredentialsList,
    refetch: refetchCredentialsList,
  } = trpc.credentials.listCredentials.useQuery(
    {
      workspaceId: workspace!.id,
      type: selectedAiProvider,
    },
    {
      enabled: !!workspace?.id && !!selectedAiProvider,
    },
  );

  const {
    data: existingCredential,
    isLoading: loadingExistingCredential,
    refetch: refetchExistingCredential,
  } = trpc.credentials.getCredentials.useQuery(
    {
      workspaceId: workspace?.id as string,
      credentialsId: workspace?.aiFeatureCredentialId as string,
    },
    {
      enabled: !!workspace?.id && !!workspace?.aiFeatureCredentialId,
    },
  );

  const saveAiFeaturesCredential = (
    credentialId: string,
    credentialsType: aiProvidersType,
  ) => {
    if (!workspace?.id || !selectedAiProvider) return;

    updateWorkspace({
      aiFeaturePrompt: workspace.aiFeaturePrompt
        ? workspace.aiFeaturePrompt
        : defaultPromptToGenerateGroupTitles,
      aiFeatureCredentialId: credentialId,
    });
  };

  const addNewAccount = (provider: aiProvidersType) => {
    onAIModalOpen();
  };

  const handlePromptChange = (prompt: string) => {
    setAiFeaturePrompt(prompt);
    saveAiFeaturesPrompt(prompt);
  };

  const saveAiFeaturesPrompt = (prompt: string) => {
    if (!workspace?.id) return;

    updateWorkspace({ aiFeaturePrompt: prompt });
  };

  useEffect(() => {
    // Load existing credential if already set
    if (
      !!workspace?.id &&
      !!workspace?.aiFeatureCredentialId &&
      !loadingExistingCredential &&
      !!existingCredential &&
      (selectedAiProvider !== (existingCredential.type as aiProvidersType) ||
        selectedAiCredential?.id !== workspace.aiFeatureCredentialId)
    ) {
      setSelectedAiProvider(existingCredential.type as aiProvidersType);
      setSelectedAiCredential({
        id: workspace.aiFeatureCredentialId,
        name: existingCredential.name,
      });
    }
  }, [existingCredential]);

  useEffect(() => {
    if (
      workspace?.aiFeaturePrompt &&
      aiFeaturePrompt !== workspace.aiFeaturePrompt
    ) {
      setAiFeaturePrompt(workspace.aiFeaturePrompt);
    }
  }, [workspace?.aiFeaturePrompt]);

  return (
    <>
      {workspace && !!workspace.inEditorAiFeaturesEnabled && (
        <>
          <HStack>
            <Flex>
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
                        setSelectedAiCredential(null);
                        refetchCredentialsList();
                      }}
                    >
                      <BlockLabel type={type} />
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>
            </Flex>
            {!!selectedAiProvider &&
              !!credentialsList &&
              !!credentialsList.credentials &&
              !loadingCredentialsList && (
                <Flex>
                  <>
                    {credentialsList.credentials.length > 0 && (
                      <Menu isLazy>
                        <MenuButton
                          as={Button}
                          size="sm"
                          rightIcon={<ChevronDownIcon />}
                        >
                          {selectedAiCredential ? (
                            <Flex gap={2}>
                              <Text>{selectedAiCredential.name}</Text>
                            </Flex>
                          ) : (
                            `Select account`
                          )}
                        </MenuButton>
                        <MenuList>
                          {credentialsList?.credentials.map((cred) => (
                            <MenuItem
                              key={cred.id}
                              onClick={() => {
                                setSelectedAiCredential({
                                  id: cred.id,
                                  name: cred.name,
                                });
                                saveAiFeaturesCredential(
                                  cred.id,
                                  cred.type as aiProvidersType,
                                );
                              }}
                            >
                              <Text>{cred.name}</Text>
                            </MenuItem>
                          ))}
                          <MenuItem
                            icon={<PlusIcon />}
                            onClick={() => addNewAccount(selectedAiProvider)}
                          >
                            <Text>Connect new</Text>
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    )}
                    {credentialsList.credentials.length === 0 && (
                      <Button
                        size={"sm"}
                        leftIcon={<PlusIcon />}
                        onClick={() => addNewAccount(selectedAiProvider)}
                      >
                        {`Add account`}
                      </Button>
                    )}
                  </>
                </Flex>
              )}
          </HStack>

          {!!workspace.aiFeatureCredentialId && !!workspace.aiFeaturePrompt && (
            <Stack>
              <Textarea
                label={"System Prompt"}
                withVariableButton={false}
                defaultValue={aiFeaturePrompt}
                onChange={handlePromptChange}
                moreInfoTooltip="Prompt to generate group titles in the block editor"
              />
            </Stack>
          )}
        </>
      )}
      <AICredentialsModal
        isOpen={isAIModalOpen}
        onClose={onAIModalClose}
        onNewCredentials={(credentialsId, provider) =>
          saveAiFeaturesCredential(credentialsId, provider)
        }
        aiProvider={selectedAiProvider!}
      />
    </>
  );
};

const AICredentialsModal = ({
  isOpen,
  onClose,
  onNewCredentials,
  aiProvider,
}: {
  isOpen: boolean;
  onClose: () => void;
  onNewCredentials: (credentialsId: string, provider: aiProvidersType) => void;
  aiProvider: aiProvidersType;
}) => {
  if (!aiProvider) return null;

  const { blockDef } = useForgedBlock(aiProvider);

  return (
    <>
      {aiProvider === "openai" && (
        <OpenAICredentialsModal
          isOpen={isOpen}
          onClose={onClose}
          onNewCredentials={(credentialsId) =>
            onNewCredentials(credentialsId, aiProvider)
          }
        />
      )}
      <CreateForgedCredentialsModal
        blockDef={blockDef!}
        isOpen={isOpen}
        onClose={onClose}
        onNewCredentials={(credentialsId) =>
          onNewCredentials(credentialsId, aiProvider)
        }
      />
    </>
  );
};
