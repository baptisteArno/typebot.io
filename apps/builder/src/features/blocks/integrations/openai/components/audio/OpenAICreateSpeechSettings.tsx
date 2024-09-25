import { DropdownList } from "@/components/DropdownList";
import { TextLink } from "@/components/TextLink";
import { Textarea } from "@/components/inputs";
import { VariableSearchInput } from "@/components/inputs/VariableSearchInput";
import { FormControl, FormLabel, Stack, Text } from "@chakra-ui/react";
import { openAIVoices } from "@typebot.io/blocks-integrations/openai/constants";
import type { CreateSpeechOpenAIOptions } from "@typebot.io/blocks-integrations/openai/schema";
import type { Variable } from "@typebot.io/variables/schemas";
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

  const updateVoice = (voice: (typeof openAIVoices)[number]) => {
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
          <Textarea
            defaultValue={options.input}
            onChange={updateInput}
            label="Input:"
          />
          <FormControl>
            <FormLabel>Voice:</FormLabel>
            <DropdownList
              currentItem={options.voice}
              onItemSelect={updateVoice}
              items={openAIVoices}
              placeholder="Select a voice"
              w="full"
            />
          </FormControl>
          <FormControl>
            <FormLabel>Save URL:</FormLabel>
            <VariableSearchInput
              initialVariableId={options.saveUrlInVariableId}
              onSelectVariable={updateSaveUrlInVariableId}
            />
          </FormControl>
        </>
      )}
    </Stack>
  );
};
