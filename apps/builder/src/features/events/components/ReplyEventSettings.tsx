import { Stack } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import type { ReplyEvent } from "@typebot.io/events/schemas";
import { Accordion } from "@typebot.io/ui/components/Accordion";
import { Field } from "@typebot.io/ui/components/Field";
import { MoreInfoTooltip } from "@typebot.io/ui/components/MoreInfoTooltip";
import type { Variable } from "@typebot.io/variables/schemas";
import { VariablesCombobox } from "@/components/inputs/VariablesCombobox";

export const ReplyEventSettings = ({
  options,
  onOptionsChange,
}: {
  options: ReplyEvent["options"];
  onOptionsChange: (options: ReplyEvent["options"]) => void;
}) => {
  const { t } = useTranslate();

  const updateContentVariableId = (variable?: Variable) =>
    onOptionsChange({
      ...options,
      contentVariableId: variable?.id,
    });

  const updateInputTypeVariableId = (variable?: Variable) =>
    onOptionsChange({
      ...options,
      inputTypeVariableId: variable?.id,
    });

  const updateInputNameVariableId = (variable?: Variable) =>
    onOptionsChange({
      ...options,
      inputNameVariableId: variable?.id,
    });

  return (
    <Stack p="2" spacing={4}>
      <Accordion.Root>
        <Accordion.Item>
          <Accordion.Trigger>
            {t("blocks.events.reply.settings.variableMappingAccordion.title")}
          </Accordion.Trigger>
          <Accordion.Panel>
            <Field.Root>
              <Field.Label>
                {t("blocks.events.reply.settings.contentVariable.label")}
              </Field.Label>
              <VariablesCombobox
                initialVariableId={options?.contentVariableId}
                onSelectVariable={updateContentVariableId}
              />
            </Field.Root>
            <Field.Root>
              <Field.Label>
                {t("blocks.events.reply.settings.inputTypeVariable.label")}
                <MoreInfoTooltip>
                  {t("blocks.events.reply.settings.inputTypeVariable.infoText")}
                </MoreInfoTooltip>
              </Field.Label>
              <VariablesCombobox
                initialVariableId={options?.inputTypeVariableId}
                onSelectVariable={updateInputTypeVariableId}
              />
            </Field.Root>
            <Field.Root>
              <Field.Label>
                {t("blocks.events.reply.settings.inputNameVariable.label")}
                <MoreInfoTooltip>
                  {t("blocks.events.reply.settings.inputNameVariable.infoText")}
                </MoreInfoTooltip>
              </Field.Label>
              <VariablesCombobox
                initialVariableId={options?.inputNameVariableId}
                onSelectVariable={updateInputNameVariableId}
              />
            </Field.Root>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion.Root>
    </Stack>
  );
};
