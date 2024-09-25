import { TextInput } from "@/components/inputs";
import { VariableSearchInput } from "@/components/inputs/VariableSearchInput";
import { FormLabel, Stack } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { defaultEmailInputOptions } from "@typebot.io/blocks-inputs/email/constants";
import type { EmailInputBlock } from "@typebot.io/blocks-inputs/email/schema";
import type { Variable } from "@typebot.io/variables/schemas";
import React from "react";

type Props = {
  options: EmailInputBlock["options"];
  onOptionsChange: (options: EmailInputBlock["options"]) => void;
};

export const EmailInputSettings = ({ options, onOptionsChange }: Props) => {
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

  return (
    <Stack spacing={4}>
      <TextInput
        label={t("blocks.inputs.settings.placeholder.label")}
        defaultValue={
          options?.labels?.placeholder ??
          defaultEmailInputOptions.labels.placeholder
        }
        onChange={handlePlaceholderChange}
      />
      <TextInput
        label={t("blocks.inputs.settings.button.label")}
        defaultValue={
          options?.labels?.button ?? defaultEmailInputOptions.labels.button
        }
        onChange={handleButtonLabelChange}
      />
      <TextInput
        label={t("blocks.inputs.settings.retryMessage.label")}
        defaultValue={
          options?.retryMessageContent ??
          defaultEmailInputOptions.retryMessageContent
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
