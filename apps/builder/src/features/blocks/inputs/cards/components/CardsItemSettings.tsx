import { SwitchWithRelatedSettings } from "@/components/SwitchWithRelatedSettings";
import { TextInput } from "@/components/inputs/TextInput";
import { ConditionForm } from "@/features/blocks/logic/condition/components/ConditionForm";
import { Stack } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import type { CardsItem } from "@typebot.io/blocks-inputs/cards/schema";
import { LogicalOperator } from "@typebot.io/conditions/constants";
import type { Condition } from "@typebot.io/conditions/schemas";
import React from "react";

type Props = {
  options: CardsItem["options"];
  onSettingsChange: (updates: CardsItem["options"]) => void;
};

export const CardsItemSettings = ({ options, onSettingsChange }: Props) => {
  const { t } = useTranslate();

  const updateIsDisplayConditionEnabled = (isEnabled: boolean) =>
    onSettingsChange({
      ...options,
      displayCondition: {
        ...options?.displayCondition,
        isEnabled,
      },
    });

  const updateDisplayCondition = (condition: Condition) =>
    onSettingsChange({
      ...options,
      displayCondition: {
        ...options?.displayCondition,
        condition,
      },
    });

  const updateButtonValue = (value: string) =>
    onSettingsChange({
      ...options,
      internalValue: value,
    });

  return (
    <Stack spacing={4}>
      <SwitchWithRelatedSettings
        label={t("blocks.inputs.settings.displayCondition.label")}
        moreInfoContent={t(
          "blocks.inputs.button.buttonSettings.displayCondition.infoText.label",
        )}
        initialValue={options?.displayCondition?.isEnabled ?? false}
        onCheckChange={updateIsDisplayConditionEnabled}
      >
        <ConditionForm
          condition={
            options?.displayCondition?.condition ?? {
              comparisons: [],
              logicalOperator: LogicalOperator.AND,
            }
          }
          onConditionChange={updateDisplayCondition}
        />
      </SwitchWithRelatedSettings>
      <TextInput
        label={t("blocks.inputs.internalValue.label")}
        moreInfoTooltip={t(
          "blocks.inputs.button.buttonSettings.internalValue.helperText",
        )}
        defaultValue={options?.internalValue}
        onChange={updateButtonValue}
      />
    </Stack>
  );
};
