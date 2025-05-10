import { DropdownList } from "@/components/DropdownList";
import { TextInput } from "@/components/inputs";
import { VariableSearchInput } from "@/components/inputs/VariableSearchInput";
import { FormLabel, Stack } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { defaultUrlInputOptions } from "@typebot.io/blocks-inputs/url/constants";
import type { UrlInputBlock } from "@typebot.io/blocks-inputs/url/schema";
import type { Variable } from "@typebot.io/variables/schemas";
import React from "react";

type Props = {
  options: UrlInputBlock["options"];
  onOptionsChange: (options: UrlInputBlock["options"]) => void;
};

export const UrlInputSettings = ({ options, onOptionsChange }: Props) => {
  const { t } = useTranslate();
  const handlePlaceholderChange = (placeholder: string) =>
    onOptionsChange({
      ...options,
      labels: { ...options?.labels, placeholder },
    });
  const handleButtonLabelChange = (button: string) =>
    onOptionsChange({ ...options, labels: { ...options?.labels, button } });
  const handleVariableChange = (variable?: Variable) =>
    onOptionsChange({ ...options, variableId: variable?.id });
  const handleRetryMessageChange = (retryMessageContent: string) =>
    onOptionsChange({ ...options, retryMessageContent });
  const updateInputMode = (inputMode: string) =>
    onOptionsChange({
      ...options,
      inputMode: inputMode as "text" | "url",
    });
  return (
    <Stack spacing={4}>
      <TextInput
        label={t("blocks.inputs.settings.placeholder.label")}
        defaultValue={
          options?.labels?.placeholder ??
          defaultUrlInputOptions.labels.placeholder
        }
        onChange={handlePlaceholderChange}
      />
      <TextInput
        label={t("blocks.inputs.settings.button.label")}
        defaultValue={
          options?.labels?.button ?? defaultUrlInputOptions.labels.button
        }
        onChange={handleButtonLabelChange}
      />
      <DropdownList
        label="Keyboard type:"
        moreInfoTooltip="Changes the type of keyboard that appears on mobile devices.
This is helpful for collecting website URLs."
        currentItem={options?.inputMode ?? "url"}
        onItemSelect={updateInputMode}
        items={[
          { label: "Default", value: "text" },
          { label: "URL", value: "url" },
        ]}
      />
      <TextInput
        label={t("blocks.inputs.settings.retryMessage.label")}
        defaultValue={
          options?.retryMessageContent ??
          defaultUrlInputOptions.retryMessageContent
        }
        onChange={handleRetryMessageChange}
      />
      <Stack>
        <FormLabel mb="0" htmlFor="variable">
          {t("blocks.inputs.settings.saveAnswer.label")}
        </FormLabel>
        <VariableSearchInput
          initialVariableId={options?.variableId}
          onSelectVariable={handleVariableChange}
        />
      </Stack>
    </Stack>
  );
};
