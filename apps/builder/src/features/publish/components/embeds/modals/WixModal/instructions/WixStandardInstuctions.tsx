import { Code, ListItem, OrderedList, Stack, Text } from "@chakra-ui/react";
import { JavascriptStandardSnippet } from "../../Javascript/JavascriptStandardSnippet";

export const WixStandardInstructions = () => {
  return (
    <OrderedList spacing={4} pl={5}>
      <ListItem>
        In the Wix Website Editor:
        <Code>
          Add {">"} Embed Code {">"} Embed HTML
        </Code>
      </ListItem>
      <ListItem>
        <Stack spacing={4}>
          <Text>
            Click on <Code>Enter code</Code> and paste this code:
          </Text>
          <JavascriptStandardSnippet widthLabel="100%" heightLabel="100%" />
        </Stack>
      </ListItem>
    </OrderedList>
  );
};
