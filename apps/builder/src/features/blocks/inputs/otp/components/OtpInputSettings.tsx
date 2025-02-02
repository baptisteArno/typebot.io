import { NumberInput, TextInput } from "@/components/inputs";
import { VariableSearchInput } from "@/components/inputs/VariableSearchInput";
import { HttpRequestAdvancedConfigForm } from "@/features/blocks/integrations/httpRequest/components/HttpRequestAdvancedConfigForm";
import { FormLabel, Stack } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import type { OtpInputBlock } from "@typebot.io/blocks-inputs/otp/schema";
import { defaultTextInputOptions } from "@typebot.io/blocks-inputs/text/constants";
import type { HttpRequest } from "@typebot.io/blocks-integrations/httpRequest/schema";
import type { Variable } from "@typebot.io/variables/schemas";
import React from "react";

type Props = {
  block: OtpInputBlock;
  onOptionsChange: (options: OtpInputBlock["options"]) => void;
};

export const OtpInputSettings = ({
  block: { id: blockId, options },
  onOptionsChange,
}: Props) => {
  const { t } = useTranslate();

  const updateCodeLength = (
    codeLength?: NonNullable<OtpInputBlock["options"]>["codeLength"],
  ) => onOptionsChange({ ...options, codeLength });

  const updateButtonLabel = (button: string) =>
    onOptionsChange({ ...options, labels: { ...options?.labels, button } });

  const updateVariableId = (variable?: Variable) =>
    onOptionsChange({ ...options, variableId: variable?.id });

  const setLocalWebhook = async (newLocalWebhook: HttpRequest) => {
    onOptionsChange({ ...options, webhook: newLocalWebhook });
  };

  const updateUrl = (url: string) => {
    onOptionsChange({ ...options, webhook: { ...options?.webhook, url } });
  };

  return (
    <Stack spacing={4}>
      <TextInput
        label={t("blocks.inputs.settings.button.label")}
        defaultValue={
          options?.labels?.button ?? defaultTextInputOptions.labels.button
        }
        onChange={updateButtonLabel}
      />
      <NumberInput
        label={t("blocks.inputs.otp.settings.codeLength.label")}
        defaultValue={options?.codeLength}
        onValueChange={updateCodeLength}
      />
      <Stack>
        <FormLabel mb="0" htmlFor="variable">
          {t("blocks.inputs.settings.saveAnswer.label")}
        </FormLabel>
        <VariableSearchInput
          initialVariableId={options?.variableId}
          onSelectVariable={updateVariableId}
        />
      </Stack>
      <Stack spacing={4}>
        <TextInput
          placeholder="Paste URL..."
          defaultValue={options?.webhook?.url}
          onChange={updateUrl}
        />
        <HttpRequestAdvancedConfigForm
          blockId={blockId}
          httpRequest={options?.webhook}
          options={options}
          onHttpRequestChange={setLocalWebhook}
          onOptionsChange={onOptionsChange}
        />
      </Stack>
    </Stack>
  );
};
