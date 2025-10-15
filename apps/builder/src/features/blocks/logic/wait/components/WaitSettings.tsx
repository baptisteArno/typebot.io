import { Stack } from "@chakra-ui/react";
import { defaultWaitOptions } from "@typebot.io/blocks-logic/wait/constants";
import type { WaitBlock } from "@typebot.io/blocks-logic/wait/schema";
import { Accordion } from "@typebot.io/ui/components/Accordion";
import { Field } from "@typebot.io/ui/components/Field";
import { MoreInfoTooltip } from "@typebot.io/ui/components/MoreInfoTooltip";
import { Switch } from "@typebot.io/ui/components/Switch";
import { TextInput } from "@/components/inputs/TextInput";

type Props = {
  options: WaitBlock["options"];
  onOptionsChange: (options: WaitBlock["options"]) => void;
};

export const WaitSettings = ({ options, onOptionsChange }: Props) => {
  const handleSecondsChange = (secondsToWaitFor: string | undefined) => {
    onOptionsChange({ ...options, secondsToWaitFor });
  };

  const updateShouldPause = (shouldPause: boolean) => {
    onOptionsChange({ ...options, shouldPause });
  };

  return (
    <Stack spacing={4}>
      <TextInput
        label="Seconds to wait for:"
        defaultValue={options?.secondsToWaitFor}
        onChange={handleSecondsChange}
      />
      <Accordion.Root>
        <Accordion.Item>
          <Accordion.Trigger>Advanced</Accordion.Trigger>
          <Accordion.Panel>
            <Field.Root className="flex-row items-center">
              <Switch
                checked={options?.shouldPause ?? defaultWaitOptions.shouldPause}
                onCheckedChange={updateShouldPause}
              />
              <Field.Label>
                Pause the flow{" "}
                <MoreInfoTooltip>
                  When enabled, the flow is paused until the client sends
                  another message. This is automatic on the web bot.
                </MoreInfoTooltip>
              </Field.Label>
            </Field.Root>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion.Root>
    </Stack>
  );
};
