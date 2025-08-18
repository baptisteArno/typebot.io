import { ListItem, OrderedList, Stack, Text } from "@chakra-ui/react";
import { useState } from "react";
import { PopupSettings } from "../../../settings/PopupSettings";
import { InstallReactPackageSnippet } from "../InstallReactPackageSnippet";
import { ReactPopupSnippet } from "../ReactPopupSnippet";

export const ReactPopupInstructions = () => {
  const [inputValue, setInputValue] = useState<number>();

  return (
    <OrderedList spacing={4} pl={5}>
      <ListItem>
        <Stack spacing={4}>
          <Text>Install the packages</Text>
          <InstallReactPackageSnippet />
        </Stack>
      </ListItem>
      <ListItem>
        <Stack spacing={4}>
          <PopupSettings
            onUpdateSettings={(settings) =>
              setInputValue(settings.autoShowDelay)
            }
          />
          <ReactPopupSnippet autoShowDelay={inputValue} />
        </Stack>
      </ListItem>
    </OrderedList>
  );
};
