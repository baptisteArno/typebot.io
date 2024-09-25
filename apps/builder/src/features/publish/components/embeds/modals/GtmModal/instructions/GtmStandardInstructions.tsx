import { CodeEditor } from "@/components/inputs/CodeEditor";
import { Code, ListItem, OrderedList, Stack, Text } from "@chakra-ui/react";
import type { Typebot } from "@typebot.io/typebot/schemas/typebot";
import { useState } from "react";
import { StandardSettings } from "../../../settings/StandardSettings";
import {
  parseStandardElementCode,
  parseStandardHeadCode,
} from "../../Javascript/JavascriptStandardSnippet";

export const GtmStandardInstructions = ({
  publicId,
}: Pick<Typebot, "publicId">) => {
  const [windowSizes, setWindowSizes] = useState<{
    height: string;
    width?: string;
  }>({
    height: "100%",
    width: "100%",
  });

  const headCode = parseStandardHeadCode(publicId);

  const elementCode = parseStandardElementCode(
    windowSizes.width,
    windowSizes.height,
  );

  return (
    <OrderedList spacing={4} pl={5}>
      <ListItem>
        On your GTM account dashboard, click on <Code>Add a new tag</Code>
      </ListItem>
      <ListItem>
        Choose <Code>Custom HTML tag</Code> type
      </ListItem>
      <ListItem>
        Check <Code>Support document.write</Code>
      </ListItem>
      <ListItem>
        <Stack spacing={4}>
          <Text>Paste the code below:</Text>
          <CodeEditor value={headCode} isReadOnly lang="html" />
        </Stack>
      </ListItem>
      <ListItem>
        <Stack spacing={4}>
          <StandardSettings
            onUpdateWindowSettings={(sizes) =>
              setWindowSizes({
                height: sizes.heightLabel,
                width: sizes.widthLabel,
              })
            }
          />
          <Text>
            On your web page, you need to have an element on which the typebot
            will go:
          </Text>
          <CodeEditor value={elementCode} isReadOnly lang="html" />
        </Stack>
      </ListItem>
    </OrderedList>
  );
};
