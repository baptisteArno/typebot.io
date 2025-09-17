import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  FormLabel,
  Stack,
} from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import type { InvalidReplyEvent } from "@typebot.io/events/schemas";
import { MoreInfoTooltip } from "@typebot.io/ui/components/MoreInfoTooltip";
import type { Variable } from "@typebot.io/variables/schemas";
import { VariableSearchInput } from "@/components/inputs/VariableSearchInput";

export const InvalidReplyEventSettings = ({
  options,
  onOptionsChange,
}: {
  options: InvalidReplyEvent["options"];
  onOptionsChange: (options: InvalidReplyEvent["options"]) => void;
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
      <Accordion allowToggle>
        <AccordionItem>
          <AccordionButton justifyContent="space-between">
            {t("blocks.events.reply.settings.variableMappingAccordion.title")}
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel as={Stack} spacing={4}>
            <Stack>
              <FormLabel mb="0" htmlFor="variable">
                {t("blocks.events.reply.settings.contentVariable.label")}
              </FormLabel>
              <VariableSearchInput
                initialVariableId={options?.contentVariableId}
                onSelectVariable={updateContentVariableId}
              />
            </Stack>
            <Stack>
              <FormLabel mb="0" htmlFor="variable">
                {t("blocks.events.reply.settings.inputTypeVariable.label")}{" "}
                <MoreInfoTooltip>
                  {t("blocks.events.reply.settings.inputTypeVariable.infoText")}
                </MoreInfoTooltip>
              </FormLabel>
              <VariableSearchInput
                initialVariableId={options?.inputTypeVariableId}
                onSelectVariable={updateInputTypeVariableId}
              />
            </Stack>
            <Stack>
              <FormLabel mb="0" htmlFor="variable">
                {t("blocks.events.reply.settings.inputNameVariable.label")}{" "}
                <MoreInfoTooltip>
                  {t("blocks.events.reply.settings.inputNameVariable.infoText")}
                </MoreInfoTooltip>
              </FormLabel>
              <VariableSearchInput
                initialVariableId={options?.inputNameVariableId}
                onSelectVariable={updateInputNameVariableId}
              />
            </Stack>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Stack>
  );
};
