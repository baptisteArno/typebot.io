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
import { Accordion } from "@typebot.io/ui/components/Accordion";
import { Field } from "@typebot.io/ui/components/Field";
import { useOpenControls } from "@typebot.io/ui/hooks/useOpenControls";
import type { JSX } from "react";
import { BasicSelect } from "@/components/inputs/BasicSelect";
import { DebouncedTextInputWithVariablesButton } from "@/components/inputs/DebouncedTextInput";
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
  const { isOpen, onOpen, onClose } = useOpenControls();

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
    <div className="flex flex-col gap-2">
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
          <Accordion.Root>
            <Accordion.Item>
              <Accordion.Trigger>Customize provider</Accordion.Trigger>
              <Accordion.Panel>
                <Field.Root>
                  <Field.Label>Base URL</Field.Label>
                  <DebouncedTextInputWithVariablesButton
                    defaultValue={baseUrl}
                    onValueChange={updateBaseUrl}
                  />
                </Field.Root>
                {baseUrl !== defaultOpenAIOptions.baseUrl && (
                  <Field.Root>
                    <Field.Label>API version</Field.Label>
                    <DebouncedTextInputWithVariablesButton
                      defaultValue={options.apiVersion}
                      onValueChange={updateApiVersion}
                    />
                  </Field.Root>
                )}
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion.Root>

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
    </div>
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
