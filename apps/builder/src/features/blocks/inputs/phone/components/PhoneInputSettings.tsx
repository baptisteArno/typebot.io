import { TextInput } from "@/components/inputs";
import { VariableSearchInput } from "@/components/inputs/VariableSearchInput";
import { FormLabel, Stack } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { defaultPhoneInputOptions } from "@typebot.io/blocks-inputs/phone/constants";
import type { PhoneNumberInputBlock } from "@typebot.io/blocks-inputs/phone/schema";
import type { Variable } from "@typebot.io/variables/schemas";
import React from "react";
import { CountryCodeSelect } from "./CountryCodeSelect";

type Props = {
  options: PhoneNumberInputBlock["options"];
  onOptionsChange: (options: PhoneNumberInputBlock["options"]) => void;
};

export const PhoneInputSettings = ({ options, onOptionsChange }: Props) => {
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
  const handleDefaultCountryChange = (defaultCountryCode: string) =>
    onOptionsChange({ ...options, defaultCountryCode });

  return (
    <Stack spacing={4}>
      <TextInput
        label={t("blocks.inputs.settings.placeholder.label")}
        defaultValue={
          options?.labels?.placeholder ??
          defaultPhoneInputOptions.labels.placeholder
        }
        onChange={handlePlaceholderChange}
      />
      <TextInput
        label={t("blocks.inputs.settings.button.label")}
        defaultValue={
          options?.labels?.button ?? defaultPhoneInputOptions.labels.button
        }
        onChange={handleButtonLabelChange}
      />
      <Stack>
        <FormLabel mb="0" htmlFor="button">
          {t("blocks.inputs.phone.settings.defaultCountry.label")}
        </FormLabel>
        <CountryCodeSelect
          onSelect={handleDefaultCountryChange}
          countryCode={options?.defaultCountryCode}
        />
      </Stack>
      <TextInput
        label={t("blocks.inputs.settings.retryMessage.label")}
        defaultValue={
          options?.retryMessageContent ??
          defaultPhoneInputOptions.retryMessageContent
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
