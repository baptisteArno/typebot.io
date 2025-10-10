import { Stack } from "@chakra-ui/react";
import {
  chatwootTasks,
  defaultChatwootOptions,
} from "@typebot.io/blocks-integrations/chatwoot/constants";
import type { ChatwootBlock } from "@typebot.io/blocks-integrations/chatwoot/schema";
import { Accordion } from "@typebot.io/ui/components/Accordion";
import { BasicSelect } from "@/components/inputs/BasicSelect";
import { TextInput } from "@/components/inputs/TextInput";

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
    <Stack spacing={4}>
      <BasicSelect
        value={options?.task}
        defaultValue={defaultChatwootOptions.task}
        onChange={updateTask}
        items={chatwootTasks}
      />
      {task === "Show widget" && (
        <>
          <TextInput
            isRequired
            label="Base URL"
            defaultValue={options?.baseUrl ?? defaultChatwootOptions.baseUrl}
            onChange={(baseUrl: string) => {
              onOptionsChange({ ...options, baseUrl });
            }}
            withVariableButton={false}
          />
          <TextInput
            isRequired
            label="Website token"
            defaultValue={options?.websiteToken}
            onChange={(websiteToken) =>
              onOptionsChange({ ...options, websiteToken })
            }
            moreInfoTooltip="Can be found in Chatwoot under Settings > Inboxes > Settings > Configuration, in the code snippet."
          />
          <Accordion.Root>
            <Accordion.Item>
              <Accordion.Trigger>Set user details</Accordion.Trigger>
              <Accordion.Panel>
                <TextInput
                  label="ID"
                  defaultValue={options?.user?.id}
                  onChange={(id: string) => {
                    onOptionsChange({
                      ...options,
                      user: { ...options?.user, id },
                    });
                  }}
                />
                <TextInput
                  label="Name"
                  defaultValue={options?.user?.name}
                  onChange={(name: string) => {
                    onOptionsChange({
                      ...options,
                      user: { ...options?.user, name },
                    });
                  }}
                />
                <TextInput
                  label="Email"
                  defaultValue={options?.user?.email}
                  onChange={(email: string) => {
                    onOptionsChange({
                      ...options,
                      user: { ...options?.user, email },
                    });
                  }}
                />
                <TextInput
                  label="Avatar URL"
                  defaultValue={options?.user?.avatarUrl}
                  onChange={(avatarUrl: string) => {
                    onOptionsChange({
                      ...options,
                      user: { ...options?.user, avatarUrl },
                    });
                  }}
                />
                <TextInput
                  label="Phone number"
                  defaultValue={options?.user?.phoneNumber}
                  onChange={(phoneNumber: string) => {
                    onOptionsChange({
                      ...options,
                      user: { ...options?.user, phoneNumber },
                    });
                  }}
                />
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion.Root>
        </>
      )}
    </Stack>
  );
};
