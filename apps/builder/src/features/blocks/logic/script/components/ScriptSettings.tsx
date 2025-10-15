import { Stack } from "@chakra-ui/react";
import { defaultScriptOptions } from "@typebot.io/blocks-logic/script/constants";
import type { ScriptBlock } from "@typebot.io/blocks-logic/script/schema";
import { Field } from "@typebot.io/ui/components/Field";
import { MoreInfoTooltip } from "@typebot.io/ui/components/MoreInfoTooltip";
import { Switch } from "@typebot.io/ui/components/Switch";
import { CodeEditor } from "@/components/inputs/CodeEditor";
import { TextInput } from "@/components/inputs/TextInput";

type Props = {
  options: ScriptBlock["options"];
  onOptionsChange: (options: ScriptBlock["options"]) => void;
};

export const ScriptSettings = ({ options, onOptionsChange }: Props) => {
  const handleNameChange = (name: string) =>
    onOptionsChange({ ...options, name });

  const handleCodeChange = (content: string) =>
    onOptionsChange({ ...options, content });

  const updateClientExecution = (isExecutedOnClient: boolean) =>
    onOptionsChange({ ...options, isExecutedOnClient });

  return (
    <Stack spacing={4}>
      <TextInput
        label="Name:"
        defaultValue={options?.name ?? defaultScriptOptions.name}
        onChange={handleNameChange}
        withVariableButton={false}
      />
      <Field.Root className="flex-row items-center">
        <Switch
          checked={
            options?.isExecutedOnClient ??
            defaultScriptOptions.isExecutedOnClient
          }
          onCheckedChange={updateClientExecution}
        />
        <Field.Label>
          Execute on client{" "}
          <MoreInfoTooltip>
            Check this if you need access to client variables like `window` or
            `document`."
          </MoreInfoTooltip>
        </Field.Label>
      </Field.Root>
      <CodeEditor
        defaultValue={options?.content}
        lang="javascript"
        onChange={handleCodeChange}
        withLineNumbers={true}
      />
    </Stack>
  );
};
