import { Stack } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import type { CommandEvent } from "@typebot.io/events/schemas";
import { DebouncedTextInput } from "@/components/inputs/DebouncedTextInput";

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
      <DebouncedTextInput
        placeholder={t("blocks.events.command.settings.command.placeholder")}
        defaultValue={options?.command}
        onValueChange={(command) => onOptionsChange({ ...options, command })}
      />
    </Stack>
  );
};
