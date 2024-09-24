import { Code, ListItem, OrderedList, Stack, Text } from "@chakra-ui/react";
import { JavascriptStandardSnippet } from "../../Javascript/JavascriptStandardSnippet";

export const FramerStandardInstructions = () => (
  <OrderedList spacing={4} pl={5}>
    <ListItem>
      Press <Code>A</Code> to open the <Code>Add elements</Code> panel
    </ListItem>
    <ListItem>
      <Stack spacing={4}>
        <Text>
          Add an <Code>Embed</Code> element from the <Code>components</Code>{" "}
          section and paste this code:
        </Text>
        <JavascriptStandardSnippet />
      </Stack>
    </ListItem>
  </OrderedList>
);
