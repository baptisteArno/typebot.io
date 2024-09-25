import { ListItem, OrderedList, Stack, Text } from "@chakra-ui/react";
import { useState } from "react";
import { PopupSettings } from "../../../settings/PopupSettings";
import { InstallNextjsPackageSnippet } from "../InstallNextjsPackageSnippet";
import { NextjsPopupSnippet } from "../NextjsPopupSnippet";

export const NextjsPopupInstructions = () => {
  const [inputValue, setInputValue] = useState<number>();

  return (
    <OrderedList spacing={4} pl={5}>
      <ListItem>
        <Stack spacing={4}>
          <Text>Install the packages</Text>
          <InstallNextjsPackageSnippet />
        </Stack>
      </ListItem>
      <ListItem>
        <Stack spacing={4}>
          <PopupSettings
            onUpdateSettings={(settings) =>
              setInputValue(settings.autoShowDelay)
            }
          />
          <NextjsPopupSnippet autoShowDelay={inputValue} />
        </Stack>
      </ListItem>
    </OrderedList>
  );
};
