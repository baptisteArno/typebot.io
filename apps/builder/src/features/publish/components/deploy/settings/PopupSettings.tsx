import {
  Heading,
  HStack,
  Stack,
  type StackProps,
  Text,
} from "@chakra-ui/react";
import type { PopupProps } from "@typebot.io/js";
import { isDefined } from "@typebot.io/lib/utils";
import { Switch } from "@typebot.io/ui/components/Switch";
import { useEffect, useState } from "react";
import { BasicNumberInput } from "@/components/inputs/BasicNumberInput";

type Props = {
  onUpdateSettings: (windowSettings: Pick<PopupProps, "autoShowDelay">) => void;
} & StackProps;

export const PopupSettings = ({ onUpdateSettings, ...props }: Props) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [inputValue, setInputValue] = useState(5);

  useEffect(() => {
    onUpdateSettings({
      autoShowDelay: isEnabled ? inputValue * 1000 : undefined,
    });
  }, [inputValue, isEnabled, onUpdateSettings]);

  return (
    <Stack {...props} spacing={4}>
      <Heading size="sm">Popup settings</Heading>

      <HStack pl={4}>
        <Text flexShrink={0}>Auto show</Text>
        <Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
        {isEnabled && (
          <>
            <Text>after</Text>
            <BasicNumberInput
              className="max-w-40"
              defaultValue={inputValue}
              onValueChange={(val) => isDefined(val) && setInputValue(val)}
              withVariableButton={false}
            />
            <Text>seconds</Text>
          </>
        )}
      </HStack>
    </Stack>
  );
};
