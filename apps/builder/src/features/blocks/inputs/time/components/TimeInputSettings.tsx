import { SwitchWithLabel } from "@/components/inputs/SwitchWithLabel";
import { VariableSearchInput } from "@/components/inputs/VariableSearchInput";
import { FormLabel, Stack } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { defaultTimeInputOptions } from "@typebot.io/blocks-inputs/time/constants";
import type { TimeInputBlock } from "@typebot.io/blocks-inputs/time/schema";
import type { Variable } from "@typebot.io/variables/schemas";
import React from "react";

type Props = {
  options: TimeInputBlock["options"];
  onOptionsChange: (options: TimeInputBlock["options"]) => void;
};

export const TimeInputSettings = ({ options, onOptionsChange }: Props) => {
  const { t } = useTranslate();

  const updateTwentyFourHourTime = (twentyFourHourTime: boolean) =>
    onOptionsChange({ ...options, twentyFourHourTime });

  const handleVariableChange = (variable?: Variable) => {
    onOptionsChange({ ...options, variableId: variable?.id });
  };

  return (
    <Stack spacing={4}>
      <SwitchWithLabel
        label={t("blocks.inputs.time.settings.24hourTime.label")}
        initialValue={
          options?.twentyFourHourTime ??
          defaultTimeInputOptions.twentyFourHourTime
        }
        onCheckChange={updateTwentyFourHourTime}
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
