import { SwitchWithRelatedSettings } from "@/components/SwitchWithRelatedSettings";
import { ConditionForm } from "@/features/blocks/logic/condition/components/ConditionForm";
import { Stack } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import type { ButtonItem } from "@typebot.io/blocks-inputs/choice/schema";
import { LogicalOperator } from "@typebot.io/conditions/constants";
import type { Condition } from "@typebot.io/conditions/schemas";
import React from "react";

type Props = {
  item: ButtonItem;
  onSettingsChange: (updates: Omit<ButtonItem, "content">) => void;
};

export const ButtonsItemSettings = ({ item, onSettingsChange }: Props) => {
  const { t } = useTranslate();

  const updateIsDisplayConditionEnabled = (isEnabled: boolean) =>
    onSettingsChange({
      ...item,
      displayCondition: {
        ...item.displayCondition,
        isEnabled,
      },
    });

  const updateDisplayCondition = (condition: Condition) =>
    onSettingsChange({
      ...item,
      displayCondition: {
        ...item.displayCondition,
        condition,
      },
    });

  return (
    <Stack spacing={4}>
      <SwitchWithRelatedSettings
        label={t("blocks.inputs.settings.displayCondition.label")}
        moreInfoContent={t(
          "blocks.inputs.button.buttonSettings.displayCondition.infoText.label",
        )}
        initialValue={item.displayCondition?.isEnabled ?? false}
        onCheckChange={updateIsDisplayConditionEnabled}
      >
        <ConditionForm
          condition={
            item.displayCondition?.condition ?? {
              comparisons: [],
              logicalOperator: LogicalOperator.AND,
            }
          }
          onConditionChange={updateDisplayCondition}
        />
      </SwitchWithRelatedSettings>
    </Stack>
  );
};
