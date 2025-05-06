import { TextInput } from "@/components/inputs";
import { SwitchWithLabel } from "@/components/inputs/SwitchWithLabel";
import { Stack } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import type { CommandEvent } from "@typebot.io/events/schemas";

export const CommandEventSettings = ({
  options,
  onOptionsChange,
}: {
  options: CommandEvent["options"];
  onOptionsChange: (options: CommandEvent["options"]) => void;
}) => {
  const { t } = useTranslate();

  return (
    <Stack>
      <TextInput
        placeholder={t("blocks.events.command.settings.command.placeholder")}
        defaultValue={options?.command}
        onChange={(command) => onOptionsChange({ ...options, command })}
        withVariableButton={false}
      />
    </Stack>
  );
};
