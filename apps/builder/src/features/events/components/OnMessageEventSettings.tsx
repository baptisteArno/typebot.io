import { SwitchWithRelatedSettings } from "@/components/SwitchWithRelatedSettings";
import { VariableSearchInput } from "@/components/inputs/VariableSearchInput";
import { ConditionForm } from "@/features/blocks/logic/condition/components/ConditionForm";
import { FormLabel, Stack } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { LogicalOperator } from "@typebot.io/conditions/constants";
import type { Condition } from "@typebot.io/conditions/schemas";
import type { OnMessageEvent } from "@typebot.io/events/schemas";
import type { Variable } from "@typebot.io/variables/schemas";

export const OnMessageEventSettings = ({
  options,
  onOptionsChange,
}: {
  options: OnMessageEvent["options"];
  onOptionsChange: (options: OnMessageEvent["options"]) => void;
}) => {
  const { t } = useTranslate();

  const updateIsExitConditionEnabled = (isEnabled: boolean) =>
    onOptionsChange({
      ...options,
      exitCondition: {
        ...options?.exitCondition,
        isEnabled,
      },
    });

  const updateExitCondition = (condition: Condition) =>
    onOptionsChange({
      ...options,
      exitCondition: {
        ...options?.exitCondition,
        condition,
      },
    });

  return (
    <Stack>
      <Stack>
        <FormLabel mb="0" htmlFor="variable">
          {t("blocks.inputs.settings.saveAnswer.label")}
        </FormLabel>
        <VariableSearchInput
          initialVariableId={options?.variableId}
          onSelectVariable={(variable?: Variable) =>
            onOptionsChange({ ...options, variableId: variable?.id })
          }
        />
      </Stack>
      <SwitchWithRelatedSettings
        label={t("blocks.events.onMessage.settings.exitCondition.label")}
        moreInfoContent={t(
          "blocks.events.onMessage.settings.exitCondition.infoText",
        )}
        initialValue={options?.exitCondition?.isEnabled ?? false}
        onCheckChange={updateIsExitConditionEnabled}
      >
        <ConditionForm
          condition={
            options?.exitCondition?.condition ?? {
              logicalOperator: LogicalOperator.AND,
              comparisons: [],
            }
          }
          onConditionChange={updateExitCondition}
        />
      </SwitchWithRelatedSettings>
    </Stack>
  );
};
