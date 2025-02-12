import { TextInput } from "@/components/inputs";
import { SwitchWithLabel } from "@/components/inputs/SwitchWithLabel";
import { Stack } from "@chakra-ui/react";
import type { CommandEvent } from "@typebot.io/events/schemas";

export const CommandEventSettings = ({
  options,
  onOptionsChange,
}: {
  options: CommandEvent["options"];
  onOptionsChange: (options: CommandEvent["options"]) => void;
}) => {
  return (
    <Stack>
      <TextInput
        placeholder="Command"
        defaultValue={options?.command}
        onChange={(command) => onOptionsChange({ ...options, command })}
        withVariableButton={false}
      />
      <SwitchWithLabel
        label="Resume flow after"
        initialValue={options?.resumeAfter}
        onCheckChange={(resumeAfter) =>
          onOptionsChange({ ...options, resumeAfter })
        }
      />
    </Stack>
  );
};
