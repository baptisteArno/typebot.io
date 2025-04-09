import { SwitchWithRelatedSettings } from "@/components/SwitchWithRelatedSettings";
import { TextInput } from "@/components/inputs";
import { ConditionForm } from "@/features/blocks/logic/condition/components/ConditionForm";
import { Stack } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { LogicalOperator } from "@typebot.io/conditions/constants";
import type { Condition } from "@typebot.io/conditions/schemas";
import type { CommandEvent } from "@typebot.io/events/schemas";

export const CommandEventSettings = ({
  options,
  onOptionsChange,
}: {
  options: CommandEvent["options"];
  onOptionsChange: (options: CommandEvent["options"]) => void;
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
      <TextInput
        placeholder={t("blocks.events.command.settings.command.placeholder")}
        defaultValue={options?.command}
        onChange={(command) => onOptionsChange({ ...options, command })}
        withVariableButton={false}
      />
      <SwitchWithRelatedSettings
        label={t("blocks.events.reply.settings.exitCondition.label")}
        moreInfoContent={t(
          "blocks.events.reply.settings.exitCondition.infoText",
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
