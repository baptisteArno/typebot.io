import { Stack, Text } from "@chakra-ui/react";
import { openAIVoices } from "@typebot.io/blocks-integrations/openai/constants";
import type { CreateSpeechOpenAIOptions } from "@typebot.io/blocks-integrations/openai/schema";
import { Field } from "@typebot.io/ui/components/Field";
import type { Variable } from "@typebot.io/variables/schemas";
import { BasicSelect } from "@/components/inputs/BasicSelect";
import { DebouncedTextareaWithVariablesButton } from "@/components/inputs/DebouncedTextarea";
import { VariablesCombobox } from "@/components/inputs/VariablesCombobox";
import { TextLink } from "@/components/TextLink";
import { ModelsDropdown } from "../ModelsDropdown";

const apiReferenceUrl =
  "https://platform.openai.com/docs/api-reference/audio/createSpeech";

type Props = {
  options: CreateSpeechOpenAIOptions;
  onOptionsChange: (options: CreateSpeechOpenAIOptions) => void;
};

export const OpenAICreateSpeechSettings = ({
  options,
  onOptionsChange,
}: Props) => {
  const updateModel = (model: string | undefined) => {
    onOptionsChange({
      ...options,
      model,
    });
  };

  const updateInput = (input: string | undefined) => {
    onOptionsChange({
      ...options,
      input,
    });
  };

  const updateVoice = (voice: (typeof openAIVoices)[number] | undefined) => {
    onOptionsChange({
      ...options,
      voice,
    });
  };

  const updateSaveUrlInVariableId = (
    variable: Pick<Variable, "id" | "name"> | undefined,
  ) => {
    onOptionsChange({
      ...options,
      saveUrlInVariableId: variable?.id,
    });
  };

  return (
    <Stack spacing={4} pt="2">
      <Text fontSize="sm" color="gray.500">
        Read the{" "}
        <TextLink href={apiReferenceUrl} isExternal>
          API reference
        </TextLink>{" "}
        to better understand the available options.
      </Text>
      {options.credentialsId && (
        <>
          <ModelsDropdown
            credentialsId={options.credentialsId}
            defaultValue={options.model}
            baseUrl={options.baseUrl}
            apiVersion={options.apiVersion}
            type="tts"
            onChange={updateModel}
          />
          <Field.Root>
            <Field.Label>Input:</Field.Label>
            <Field.Control
              render={(props) => (
                <DebouncedTextareaWithVariablesButton
                  {...props}
                  defaultValue={options.input}
                  onValueChange={updateInput}
                />
              )}
            />
          </Field.Root>
          <Field.Root>
            <Field.Label>Voice:</Field.Label>
            <BasicSelect
              value={options.voice}
              onChange={updateVoice}
              items={openAIVoices}
              placeholder="Select a voice"
              className="w-full"
            />
          </Field.Root>
          <Field.Root>
            <Field.Label>Save URL:</Field.Label>
            <VariablesCombobox
              initialVariableId={options.saveUrlInVariableId}
              onSelectVariable={updateSaveUrlInVariableId}
            />
          </Field.Root>
        </>
      )}
    </Stack>
  );
};
