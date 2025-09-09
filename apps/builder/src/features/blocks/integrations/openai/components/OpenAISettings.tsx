import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import {
  defaultOpenAIOptions,
  openAITasks,
} from "@typebot.io/blocks-integrations/openai/constants";
import type {
  ChatCompletionOpenAIOptions,
  CreateImageOpenAIOptions,
  CreateSpeechOpenAIOptions,
  OpenAIBlock,
} from "@typebot.io/blocks-integrations/openai/schema";
import { TextInput } from "@/components/inputs";
import { BasicSelect } from "@/components/inputs/BasicSelect";
import { CredentialsDropdown } from "@/features/credentials/components/CredentialsDropdown";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { OpenAICreateSpeechSettings } from "./audio/OpenAICreateSpeechSettings";
import { OpenAIChatCompletionSettings } from "./createChatCompletion/OpenAIChatCompletionSettings";
import { OpenAICredentialsDialog } from "./OpenAICredentialsDialog";

type OpenAITask = (typeof openAITasks)[number];

type Props = {
  block: OpenAIBlock;
  onOptionsChange: (options: OpenAIBlock["options"]) => void;
};

export const OpenAISettings = ({
  block: { options },
  onOptionsChange,
}: Props) => {
  const { workspace } = useWorkspace();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const updateCredentialsId = (credentialsId: string | undefined) => {
    onOptionsChange({
      ...options,
      credentialsId,
    });
  };

  const updateTask = (task: OpenAITask | undefined) => {
    onOptionsChange({
      credentialsId: options?.credentialsId,
      task,
    } as OpenAIBlock["options"]);
  };

  const updateBaseUrl = (baseUrl: string) => {
    onOptionsChange({
      ...options,
      baseUrl,
    });
  };

  const updateApiVersion = (apiVersion: string) => {
    onOptionsChange({
      ...options,
      apiVersion,
    });
  };

  const baseUrl = options?.baseUrl ?? defaultOpenAIOptions.baseUrl;

  return (
    <Stack>
      {workspace && (
        <>
          <CredentialsDropdown
            type="openai"
            scope={{ type: "workspace", workspaceId: workspace.id }}
            currentCredentialsId={options?.credentialsId}
            onCredentialsSelect={updateCredentialsId}
            onCreateNewClick={onOpen}
            credentialsName="OpenAI account"
          />
          <OpenAICredentialsDialog
            isOpen={isOpen}
            onClose={onClose}
            onNewCredentials={updateCredentialsId}
          />
        </>
      )}
      {options?.credentialsId && (
        <>
          <Accordion allowToggle>
            <AccordionItem>
              <AccordionButton>
                <Text w="full" textAlign="left">
                  Customize provider
                </Text>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel as={Stack} spacing={4}>
                <TextInput
                  label="Base URL"
                  defaultValue={baseUrl}
                  onChange={updateBaseUrl}
                />
                {baseUrl !== defaultOpenAIOptions.baseUrl && (
                  <TextInput
                    label="API version"
                    defaultValue={options.apiVersion}
                    onChange={updateApiVersion}
                  />
                )}
              </AccordionPanel>
            </AccordionItem>
          </Accordion>

          <BasicSelect
            value={options.task}
            items={openAITasks.slice(0, -1)}
            onChange={updateTask}
            placeholder="Select task"
          />
          {options.task && (
            <OpenAITaskSettings
              options={options}
              onOptionsChange={onOptionsChange}
            />
          )}
        </>
      )}
    </Stack>
  );
};

const OpenAITaskSettings = ({
  options,
  onOptionsChange,
}: {
  options:
    | ChatCompletionOpenAIOptions
    | CreateImageOpenAIOptions
    | CreateSpeechOpenAIOptions;
  onOptionsChange: (options: OpenAIBlock["options"]) => void;
}): JSX.Element | null => {
  switch (options.task) {
    case "Create chat completion": {
      return (
        <OpenAIChatCompletionSettings
          options={options}
          onOptionsChange={onOptionsChange}
        />
      );
    }
    case "Create speech": {
      return (
        <OpenAICreateSpeechSettings
          options={options}
          onOptionsChange={onOptionsChange}
        />
      );
    }
    case "Create image": {
      return null;
    }
  }
};
