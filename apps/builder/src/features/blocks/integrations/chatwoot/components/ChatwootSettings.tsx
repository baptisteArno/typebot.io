import {
  chatwootTasks,
  defaultChatwootOptions,
} from "@typebot.io/blocks-integrations/chatwoot/constants";
import type { ChatwootBlock } from "@typebot.io/blocks-integrations/chatwoot/schema";
import { Accordion } from "@typebot.io/ui/components/Accordion";
import { Field } from "@typebot.io/ui/components/Field";
import { MoreInfoTooltip } from "@typebot.io/ui/components/MoreInfoTooltip";
import { BasicSelect } from "@/components/inputs/BasicSelect";
import {
  DebouncedTextInput,
  DebouncedTextInputWithVariablesButton,
} from "@/components/inputs/DebouncedTextInput";

type Props = {
  options: ChatwootBlock["options"];
  onOptionsChange: (options: ChatwootBlock["options"]) => void;
};

export const ChatwootSettings = ({ options, onOptionsChange }: Props) => {
  const updateTask = (task: (typeof chatwootTasks)[number] | undefined) => {
    onOptionsChange({ ...options, task });
  };

  const task = options?.task ?? defaultChatwootOptions.task;

  return (
    <div className="flex flex-col gap-4">
      <BasicSelect
        value={options?.task}
        defaultValue={defaultChatwootOptions.task}
        onChange={updateTask}
        items={chatwootTasks}
      />
      {task === "Show widget" && (
        <>
          <Field.Root>
            <Field.Label>Base URL</Field.Label>
            <DebouncedTextInput
              defaultValue={options?.baseUrl ?? defaultChatwootOptions.baseUrl}
              onValueChange={(baseUrl: string) => {
                onOptionsChange({ ...options, baseUrl });
              }}
            />
          </Field.Root>
          <Field.Root>
            <Field.Label>
              Website token
              <MoreInfoTooltip>
                Can be found in Chatwoot under Settings &gt; Inboxes &gt;
                Settings &gt; Configuration, in the code snippet.
              </MoreInfoTooltip>
            </Field.Label>
            <DebouncedTextInputWithVariablesButton
              defaultValue={options?.websiteToken}
              onValueChange={(websiteToken) =>
                onOptionsChange({ ...options, websiteToken })
              }
            />
          </Field.Root>
          <Accordion.Root>
            <Accordion.Item>
              <Accordion.Trigger>Set user details</Accordion.Trigger>
              <Accordion.Panel>
                <Field.Root>
                  <Field.Label>ID</Field.Label>
                  <DebouncedTextInputWithVariablesButton
                    defaultValue={options?.user?.id}
                    onValueChange={(id: string) => {
                      onOptionsChange({
                        ...options,
                        user: { ...options?.user, id },
                      });
                    }}
                  />
                </Field.Root>
                <Field.Root>
                  <Field.Label>Name</Field.Label>
                  <DebouncedTextInputWithVariablesButton
                    defaultValue={options?.user?.name}
                    onValueChange={(name: string) => {
                      onOptionsChange({
                        ...options,
                        user: { ...options?.user, name },
                      });
                    }}
                  />
                </Field.Root>
                <Field.Root>
                  <Field.Label>Email</Field.Label>
                  <DebouncedTextInputWithVariablesButton
                    defaultValue={options?.user?.email}
                    onValueChange={(email: string) => {
                      onOptionsChange({
                        ...options,
                        user: { ...options?.user, email },
                      });
                    }}
                  />
                </Field.Root>
                <Field.Root>
                  <Field.Label>Avatar URL</Field.Label>
                  <DebouncedTextInputWithVariablesButton
                    defaultValue={options?.user?.avatarUrl}
                    onValueChange={(avatarUrl: string) => {
                      onOptionsChange({
                        ...options,
                        user: { ...options?.user, avatarUrl },
                      });
                    }}
                  />
                </Field.Root>
                <Field.Root>
                  <Field.Label>Phone number</Field.Label>
                  <DebouncedTextInputWithVariablesButton
                    defaultValue={options?.user?.phoneNumber}
                    onValueChange={(phoneNumber: string) => {
                      onOptionsChange({
                        ...options,
                        user: { ...options?.user, phoneNumber },
                      });
                    }}
                  />
                </Field.Root>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion.Root>
        </>
      )}
    </div>
  );
};
