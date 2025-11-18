import { defaultScriptOptions } from "@typebot.io/blocks-logic/script/constants";
import type { ScriptBlock } from "@typebot.io/blocks-logic/script/schema";
import { Field } from "@typebot.io/ui/components/Field";
import { MoreInfoTooltip } from "@typebot.io/ui/components/MoreInfoTooltip";
import { Switch } from "@typebot.io/ui/components/Switch";
import { CodeEditor } from "@/components/inputs/CodeEditor";
import { DebouncedTextInput } from "@/components/inputs/DebouncedTextInput";
import { UnsafeScriptAlert } from "./UnsafeScriptAlert";

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

  const updateIsUnsafe = () => onOptionsChange({ ...options, isUnsafe: false });

  return (
    <div className="flex flex-col gap-4">
      <Field.Root>
        <Field.Label>Name:</Field.Label>
        <DebouncedTextInput
          defaultValue={options?.name ?? defaultScriptOptions.name}
          onValueChange={handleNameChange}
        />
      </Field.Root>
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
      {options?.isUnsafe === true && options?.isExecutedOnClient !== false && (
        <UnsafeScriptAlert onTrustClick={updateIsUnsafe} />
      )}
      <CodeEditor
        defaultValue={options?.content}
        lang="javascript"
        onChange={handleCodeChange}
        withLineNumbers={true}
      />
    </div>
  );
};
